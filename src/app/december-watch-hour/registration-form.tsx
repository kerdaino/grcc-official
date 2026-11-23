"use client";

import Script from "next/script";
import { useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import {
  ARRIVAL, DAYS, DURATIONS, EVENT_DATES, FIRST_MIDNIGHT_NOTICE, LODGING, LODGING_NOTICE, MODES, ONLINE_NOTICE,
  SESSION_TIMES, VENUE, WELFARE_NOTICE, validateWatchHour,
} from "@/lib/watchHour";

const control = "mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-fuchsia-700";
const button = "rounded-lg bg-fuchsia-800 px-5 py-3 font-semibold text-white hover:bg-fuchsia-900 disabled:opacity-60";
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
type Validated = NonNullable<ReturnType<typeof validateWatchHour>["value"]>;
type CampTurnstile = {
  render: (container: HTMLElement, options: Record<string, string | (() => void | boolean)>) => string;
  reset: (widget: string) => void;
};

function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block font-medium">{label}<input {...props} className={control} /></label>;
}

function Section({ legend, children }: { legend: string; children: React.ReactNode }) {
  return <fieldset className="min-w-0 space-y-4 border-t border-slate-200 pt-4">
    <legend className="pr-3 text-lg font-bold">{legend}</legend>
    {children}
  </fieldset>;
}

export default function RegistrationForm() {
  const [mode, setMode] = useState("");
  const [duration, setDuration] = useState("");
  const [lodging, setLodging] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [confirmation, setConfirmation] = useState<{ reference: string; registration: Validated }>();
  const processing = useRef(false);
  const submission = useRef<{ key: string; payload: string } | null>(null);
  const challenge = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: CampTurnstile; id: string } | null>(null);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLParagraphElement>(null);
  const physical = mode === "physical" || mode === "both";
  const church = physical && lodging === "church";

  function setupChallenge() {
    const api = (window as Window & { turnstile?: CampTurnstile }).turnstile;
    if (!api || !siteKey || !challenge.current || widget.current) return;
    try {
      widget.current = {
        api,
        id: api.render(challenge.current, {
          sitekey: siteKey, action: "watch_hour_registration",
          size: challenge.current.clientWidth < 300 ? "compact" : "normal",
          callback: () => setSecurityError(""),
          "error-callback": () => {
            setSecurityError("The security check failed. It will retry when possible. If the problem persists, reload this page.");
            return true;
          },
          "expired-callback": () => setSecurityError("The security check expired. Wait for it to refresh before submitting."),
        }),
      };
    } catch {
      setSecurityError("The security check could not load. Reload this page and try again.");
    }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing.current) return;
    setError("");
    const form = new FormData(event.currentTarget);
    const fields = {
      ...Object.fromEntries(form),
      attendance_dates: form.getAll("attendance_dates"),
      communication_consent: form.has("communication_consent"),
      needs_travel_guidance: form.get("travel") === "yes" ? true : form.get("travel") === "no" ? false : null,
    };
    const turnstileToken = form.get("cf-turnstile-response");
    delete (fields as Record<string, unknown>)["cf-turnstile-response"];
    const payload = JSON.stringify(fields);
    if (submission.current?.payload !== payload) submission.current = { payload, key: crypto.randomUUID() };
    const validation = validateWatchHour({ ...fields, idempotency_key: submission.current.key });
    const showError = (message: string) => {
      setError(message);
      requestAnimationFrame(() => feedback.current?.focus());
    };
    if (!validation.value) return showError(validation.error);
    if (!turnstileToken) return showError("Complete the security check before registering.");

    processing.current = true;
    setBusy(true);
    let completed = false;
    try {
      const response = await fetch("/api/december-watch-hour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.value, turnstileToken }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.registration_reference !== "string") {
        return showError(result.message || "Registration is temporarily unavailable. Please try again.");
      }
      completed = true;
      setConfirmation({ reference: result.registration_reference, registration: validation.value });
      requestAnimationFrame(() => {
        confirmationHeading.current?.focus();
        confirmationHeading.current?.scrollIntoView({ block: "center" });
      });
    } catch {
      showError("We could not verify the submission. Retry with the same details to recover your registration reference.");
    } finally {
      processing.current = false;
      setBusy(false);
      if (!completed && widget.current) widget.current.api.reset(widget.current.id);
    }
  }

  if (confirmation) {
    const { registration, reference } = confirmation;
    return <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 ref={confirmationHeading} tabIndex={-1} className="text-2xl font-extrabold">Your registration is confirmed</h2>
      <p>Thank you, {registration.full_name}.</p>
      <p className="rounded-lg bg-fuchsia-50 p-4">Save your registration reference <strong className="block text-lg">{reference}</strong></p>
      <p><strong>Attendance</strong> {MODES[registration.attendance_mode]}</p>
      <p><strong>Event dates</strong> {EVENT_DATES}</p>
      <ul className="list-disc pl-5">{SESSION_TIMES.map((time) => <li key={time}>{time}</li>)}</ul>
      <p>{FIRST_MIDNIGHT_NOTICE}</p>
      {registration.physical_count > 0 && <div><p>{ARRIVAL}</p><p><strong>Venue</strong> {VENUE}</p></div>}
      {registration.online_count > 0 && <p>{ONLINE_NOTICE}</p>}
      {registration.accommodation_preference === "church" && <p className="rounded-lg bg-amber-50 p-4">{WELFARE_NOTICE}</p>}
    </div>;
  }

  return (
    <form id="camp-registration" onSubmit={register} className="min-w-0 scroll-mt-24 rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-2xl font-extrabold">Camp meeting registration</h2>
      <p className="mt-2 text-slate-600">Fields marked with an asterisk are required.</p>
      <fieldset disabled={busy} className="mt-6 min-w-0 space-y-7">
        <Section legend="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name *" name="full_name" required minLength={2} maxLength={120} autoComplete="name" />
            <Input label="WhatsApp or phone number *" name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="+234 or local number" />
            <Input label="Email (optional)" name="email" type="email" maxLength={160} autoComplete="email" />
            <Input label="City, state and country of residence *" name="location" required minLength={2} maxLength={160} autoComplete="address-level2" />
          </div>
        </Section>

        <Section legend="Participation">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-medium">Attendance mode *
              <select name="attendance_mode" required className={control} value={mode} onChange={(event) => setMode(event.target.value)}>
                <option value="">Choose attendance mode</option>
                {Object.entries(MODES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label className="font-medium">Attendance duration *
              <select name="attendance_duration" required className={control} value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option value="">Choose duration</option>
                {Object.entries(DURATIONS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>
          {duration === "selected" && <fieldset className="rounded-lg bg-slate-50 p-3">
            <legend className="font-semibold">Choose your December dates *</legend>
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
              {DAYS.map((day) => <label key={day} className="flex min-h-10 items-center gap-1.5">
                <input className="accent-fuchsia-800" type="checkbox" name="attendance_dates" value={day} />{Number(day.slice(-2))} Dec
              </label>)}
            </div>
          </fieldset>}
          <Input label="Total people included (count each person once) *" name="party_size" type="number" required min={1} max={100} defaultValue={1} />
          {mode === "both" && <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <p>Count people who plan to join both ways in each mode. The total above counts each person once. These counts apply to your selected camp dates.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="People attending in person *" name="physical_count" type="number" required min={1} max={100} />
              <Input label="People attending online *" name="online_count" type="number" required min={1} max={100} />
            </div>
          </div>}
        </Section>

        {physical && <Section legend="Accommodation">
          <label className="block font-medium">Where do you plan to stay during the camp meeting? *
            <select name="accommodation_preference" required className={control} value={lodging} onChange={(event) => setLodging(event.target.value)}>
              <option value="">Choose accommodation preference</option>
              {Object.entries(LODGING).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          {church && <>
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">{LODGING_NOTICE}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Expected arrival date *" name="accommodation_arrival" type="date" required min={DAYS[0]} max={DAYS[19]} />
              <Input label="Expected departure date *" name="accommodation_departure" type="date" required min={DAYS[1]} max={DAYS[20]} />
            </div>
            <Input label="Total persons requiring accommodation *" name="accommodation_people" type="number" required min={1} max={100} />
            <fieldset className="space-y-2">
              <legend className="font-semibold">Accommodation grouping *</legend>
              <p>Enter the number of people in each grouping. Use zero for groups you do not need.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Men" name="accommodation_men" type="number" required min={0} max={100} defaultValue={0} />
                <Input label="Women" name="accommodation_women" type="number" required min={0} max={100} defaultValue={0} />
                <Input label="Family/group" name="accommodation_family" type="number" required min={0} max={100} defaultValue={0} />
              </div>
            </fieldset>
          </>}
          <label className="block font-medium">Accessibility logistics (optional)
            <textarea name="accessibility_request" className={control} maxLength={300} rows={2} aria-describedby="accessibility-help" />
          </label>
          <p id="accessibility-help" className="text-slate-600">Tell us about practical arrangements that would help you participate. Please omit medical diagnoses.</p>
        </Section>}

        <Section legend={physical ? "Travel and communication" : "Communication"}>
          {physical && <>
            <label className="block font-medium">Do you need directions or travel guidance? *
              <select name="travel" required className={control}>
                <option value="">Choose yes or no</option><option value="yes">Yes</option><option value="no">No</option>
              </select>
            </label>
            <label className="block font-medium">Arrival information (optional)
              <textarea name="arrival_info" className={control} maxLength={300} rows={2} placeholder="For example, your expected arrival time" />
            </label>
          </>}
          <label className="flex items-start gap-3">
            <input className="mt-1 size-4 shrink-0 accent-fuchsia-800" required type="checkbox" name="communication_consent" />
            <span>I agree to receive important updates about this event through WhatsApp, SMS or email. *</span>
          </label>
        </Section>
        {siteKey && <div className="max-w-full" ref={challenge} />}
        {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={setupChallenge}
          onError={() => setSecurityError("The security check could not load. Reload this page and try again.")} />}
        {(!siteKey || securityError) && <p role="alert" className="text-red-800">{securityError || "Registration is temporarily unavailable."}</p>}
        {error && <p ref={feedback} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
        <button className={button} disabled={!siteKey || busy} type="submit">
          {busy ? "Registering…" : "Register for Camp Meeting"}
        </button>
      </fieldset>
    </form>
  );
}
