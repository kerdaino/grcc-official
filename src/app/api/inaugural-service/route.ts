import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { validateInauguralRegistration } from "@/lib/inauguralService";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createReference() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length]).join("");
  return `GRCC-INA-${suffix}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const validated = validateInauguralRegistration(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, message: validated.message }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabaseServer
    .from("grcc_inaugural_registrations")
    .select("registration_reference")
    .eq("idempotency_key", validated.value.idempotency_key)
    .maybeSingle();

  if (existingError) {
    console.error("Inaugural registration idempotency lookup failed", {
      code: existingError.code,
      message: existingError.message,
    });
    return NextResponse.json({ ok: false, message: "Registration is temporarily unavailable. Please try again." }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ ok: true, registration_reference: existing.registration_reference });
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const registrationReference = createReference();
    const { data, error } = await supabaseServer
      .from("grcc_inaugural_registrations")
      .insert({ ...validated.value, registration_reference: registrationReference })
      .select("registration_reference")
      .single();

    if (!error && data) {
      return NextResponse.json({ ok: true, registration_reference: data.registration_reference }, { status: 201 });
    }

    if (error?.code === "23505") {
      const { data: duplicate } = await supabaseServer
        .from("grcc_inaugural_registrations")
        .select("registration_reference")
        .eq("idempotency_key", validated.value.idempotency_key)
        .maybeSingle();
      if (duplicate) {
        return NextResponse.json({ ok: true, registration_reference: duplicate.registration_reference });
      }
      continue;
    }

    console.error("Inaugural registration insert failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json({ ok: false, message: "We could not complete your registration. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: false, message: "We could not create a registration reference. Please try again." }, { status: 503 });
}
