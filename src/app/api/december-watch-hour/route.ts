import { createHash, randomInt } from "node:crypto";
import { after, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  ARRIVAL, EVENT_DATES, EVENT_NAME, FIRST_MIDNIGHT_NOTICE, MODES, ONLINE_NOTICE, SESSION_TIMES, VENUE,
  validateWatchHour, WATCH_HOUR_TABLE, WELFARE_NOTICE,
} from "@/lib/watchHour";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const unavailable = "Registration is temporarily unavailable. Please try again.";
const fail = (message: string, status: number) => NextResponse.json({ message }, { status });

export async function POST(request: Request) {
  let body;
  try {
    // Bound input even if no Content-Length header was sent.
    const reader = request.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) return fail("Invalid request.", 400);
    let json = "";
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      json += chunk.value;
      if (json.length > 10_000) {
        await reader.cancel();
        return fail("Registration request is too large.", 413);
      }
    }
    body = JSON.parse(json);
  } catch {
    return fail("Invalid request.", 400);
  }

  const validation = validateWatchHour(body);
  if (!validation.value) return fail(validation.error, 400);
  const value = validation.value;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const token = body.turnstileToken;
  if (!secret) return fail(unavailable, 503);
  if (typeof token !== "string" || !token || token.length > 2048) {
    return fail("Complete the security check and try again.", 400);
  }

  const digest = createHash("sha256").update(JSON.stringify(value)).digest("hex");
  async function priorSubmission() {
    return supabaseServer.from(WATCH_HOUR_TABLE)
      .select("registration_reference,submission_digest")
      .eq("idempotency_key", value.idempotency_key).maybeSingle();
  }
  function replay(row: { registration_reference: string; submission_digest: string }) {
    return row.submission_digest === digest
      ? NextResponse.json({ registration_reference: row.registration_reference })
      : fail("This submission was already used. Reload the form to start a new registration.", 409);
  }

  const { data: prior, error: lookupError } = await priorSubmission();
  if (lookupError) return fail(unavailable, 503);
  if (prior) return replay(prior);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return fail(unavailable, 503);
    const result = await response.json();
    if (result.success !== true || result.action !== "watch_hour_registration") {
      const { data: submitted } = await priorSubmission();
      return submitted ? replay(submitted) : fail("Security check expired or failed. Please try again.", 400);
    }
  } catch {
    return fail(unavailable, 503);
  }

  const church = value.accommodation_preference === "church";
  for (let attempt = 0; attempt < 8; attempt++) {
    const suffix = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    const reference = `GRCC-WH-2026-${suffix}`;
    const { error } = await supabaseServer.from(WATCH_HOUR_TABLE).insert({
      ...value, registration_reference: reference, submission_digest: digest,
      accommodation_status: church ? "pending" : null,
      welfare_status: church || value.needs_travel_guidance || value.accessibility_request ? "pending" : "none",
    });
    if (!error) {
      const { RESEND_API_KEY, RESEND_FROM_EMAIL, WATCH_HOUR_SEND_ACKNOWLEDGEMENT } = process.env;
      const to = value.email;
      if (to && RESEND_API_KEY && RESEND_FROM_EMAIL && WATCH_HOUR_SEND_ACKNOWLEDGEMENT === "true") {
        after(async () => {
          try {
            const { error: emailError } = await new Resend(RESEND_API_KEY).emails.send({
              from: RESEND_FROM_EMAIL, to,
              subject: `Your ${EVENT_NAME} registration`,
              text: [
                `Thank you, ${value.full_name}. Your registration is confirmed.`,
                `Registration reference: ${reference}`, `Attendance: ${MODES[value.attendance_mode]}`,
                EVENT_DATES, ...SESSION_TIMES, FIRST_MIDNIGHT_NOTICE,
                ...(value.physical_count ? [ARRIVAL, VENUE] : []),
                ...(value.online_count ? [ONLINE_NOTICE] : []), ...(church ? [WELFARE_NOTICE] : []),
              ].join("\n"),
            });
            if (emailError) console.error("Watch-Hour acknowledgement delivery failed.");
          } catch {
            console.error("Watch-Hour acknowledgement delivery failed.");
          }
        });
      }
      return NextResponse.json({ registration_reference: reference }, { status: 201 });
    }
    if (error.code !== "23505") {
      console.error("Watch-Hour registration insert failed", { code: error.code });
      return fail(unavailable, 503);
    }
    const { data, error: retryError } = await priorSubmission();
    if (retryError) return fail(unavailable, 503);
    if (data) return replay(data);
  }
  return fail(unavailable, 503);
}
