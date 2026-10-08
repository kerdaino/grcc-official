"use client";

import PageHero from "@/components/PageHero";
import {
  ACCOMMODATION_NIGHTS,
  INAUGURAL_SESSIONS,
  TRANSPORT_MODES,
  type AccommodationNight,
  type InauguralSession,
} from "@/lib/inauguralService";
import { useRef, useState } from "react";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  churchMinistry: string;
  sessions: InauguralSession[];
  partySize: string;
  needsAccommodation: "" | "yes" | "no";
  accommodationNights: AccommodationNight[];
  accommodationPeople: string;
  needsTravelGuidance: "" | "yes" | "no";
  transportMode: string;
  referralSource: string;
  consent: boolean;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  location: "",
  churchMinistry: "",
  sessions: [],
  partySize: "1",
  needsAccommodation: "",
  accommodationNights: [],
  accommodationPeople: "1",
  needsTravelGuidance: "",
  transportMode: "",
  referralSource: "",
  consent: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-100";

function newRequestId() {
  return crypto.randomUUID();
}

export default function InauguralServicePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const requestId = useRef("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSession(session: InauguralSession) {
    setForm((current) => {
      if (session === "All Sessions") {
        return { ...current, sessions: current.sessions.includes(session) ? [] : [session] };
      }
      const withoutAll = current.sessions.filter((value) => value !== "All Sessions");
      return {
        ...current,
        sessions: withoutAll.includes(session)
          ? withoutAll.filter((value) => value !== session)
          : [...withoutAll, session],
      };
    });
  }

  function toggleNight(night: AccommodationNight) {
    update(
      "accommodationNights",
      form.accommodationNights.includes(night)
        ? form.accommodationNights.filter((value) => value !== night)
        : [...form.accommodationNights, night]
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    if (!requestId.current) requestId.current = newRequestId();

    try {
      const response = await fetch("/api/inaugural-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          phone: form.phone,
          email: form.email,
          location: form.location,
          church_ministry: form.churchMinistry,
          expected_sessions: form.sessions,
          party_size: Number(form.partySize),
          needs_accommodation: form.needsAccommodation === "yes",
          accommodation_nights: form.needsAccommodation === "yes" ? form.accommodationNights : [],
          accommodation_people: form.needsAccommodation === "yes" ? Number(form.accommodationPeople) : null,
          needs_travel_guidance: form.needsTravelGuidance === "yes",
          transport_mode: form.needsTravelGuidance === "yes" ? form.transportMode : null,
          referral_source: form.referralSource,
          communication_consent: form.consent,
          idempotency_key: requestId.current,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setError(data?.message || "Registration failed. Please check your details and try again.");
        return;
      }
      setReference(data.registration_reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("We could not connect to the registration service. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <main>
        <PageHero title="GRCC Inaugural Service 2026" subtitle="Your registration has been received." />
        <section className="bg-slate-50 px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">✓</div>
            <h2 className="mt-5 text-3xl font-extrabold text-slate-950">You&apos;re registered!</h2>
            <p className="mt-3 text-lg text-slate-700">We look forward to welcoming you to the GRCC Inaugural Service.</p>
            <div className="mt-7 rounded-2xl bg-fuchsia-50 p-5 text-center ring-1 ring-fuchsia-200">
              <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-700">Registration reference</p>
              <p className="mt-2 text-3xl font-black tracking-wide text-slate-950">{reference}</p>
              <p className="mt-2 text-sm text-slate-600">Please save this reference for your records.</p>
            </div>
            <div className="mt-7 space-y-5 leading-relaxed text-slate-700">
              <div>
                <p className="font-bold text-slate-950">Venue:</p>
                <address className="not-italic">266, Balogun Bus Stop, Along Ope Ilu Road,<br />Agbado, Ogun State, Nigeria.</address>
              </div>
              <p>Our team will send important programme updates and travel information to your WhatsApp number before the programme.</p>
              <p>If you requested accommodation or transportation guidance, a member of the team will contact you separately.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        title="GRCC Inaugural Service 2026"
        subtitle="Join Gloryrealm Christian Centre for four days of worship, fellowship, and the Word. Register below to help us prepare to welcome you."
      />
      <section className="bg-slate-50 px-4 py-12 md:py-16">
        <form onSubmit={submit} className="mx-auto max-w-3xl rounded-3xl border bg-white p-5 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-fuchsia-700">Attendance registration</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950 md:text-3xl">Tell us how to prepare for you</h2>
            <p className="mt-2 text-sm text-slate-600">Fields marked <span aria-hidden="true">*</span> are required.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="font-semibold text-slate-800">Full Name *
              <input required maxLength={120} autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
            </label>
            <label className="font-semibold text-slate-800">WhatsApp / Phone Number *
              <input required minLength={7} maxLength={30} inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </label>
            <label className="font-semibold text-slate-800">Email <span className="font-normal text-slate-500">(optional)</span>
              <input type="email" maxLength={160} autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </label>
            <label className="font-semibold text-slate-800">Where are you coming from? *
              <input required maxLength={160} autoComplete="address-level2" placeholder="Town / City / State" value={form.location} onChange={(e) => update("location", e.target.value)} className={inputClass} />
            </label>
            <label className="font-semibold text-slate-800 md:col-span-2">Church / Ministry <span className="font-normal text-slate-500">(optional)</span>
              <input maxLength={160} value={form.churchMinistry} onChange={(e) => update("churchMinistry", e.target.value)} className={inputClass} />
            </label>
          </div>

          <fieldset className="mt-8">
            <legend className="font-bold text-slate-900">Which sessions do you expect to attend? *</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {INAUGURAL_SESSIONS.map((session) => (
                <label key={session} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <input type="checkbox" checked={form.sessions.includes(session)} onChange={() => toggleSession(session)} className="mt-1 h-4 w-4 accent-fuchsia-700" />
                  <span className="font-medium text-slate-800">{session}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-8 block font-bold text-slate-900">Number of people being registered, including the registrant *
            <input required type="number" min={1} max={100} step={1} inputMode="numeric" value={form.partySize} onChange={(e) => update("partySize", e.target.value)} className={`${inputClass} max-w-xs`} />
          </label>

          <fieldset className="mt-8">
            <legend className="font-bold text-slate-900">Will you require accommodation assistance? *</legend>
            <div className="mt-3 flex gap-5">
              {(["yes", "no"] as const).map((choice) => (
                <label key={choice} className="flex items-center gap-2 font-medium text-slate-800">
                  <input required type="radio" name="needsAccommodation" value={choice} checked={form.needsAccommodation === choice} onChange={() => update("needsAccommodation", choice)} className="h-4 w-4 accent-fuchsia-700" />
                  {choice === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              <strong>Please note:</strong> indicating a need for accommodation does not automatically guarantee free accommodation. Our team will contact you with available options or guidance.
            </div>
            {form.needsAccommodation === "yes" ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">Which nights? *</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {ACCOMMODATION_NIGHTS.map((night) => (
                    <label key={night} className="flex items-center gap-2 text-slate-800">
                      <input type="checkbox" checked={form.accommodationNights.includes(night)} onChange={() => toggleNight(night)} className="h-4 w-4 accent-fuchsia-700" /> {night}
                    </label>
                  ))}
                </div>
                <label className="mt-5 block font-semibold text-slate-900">Number of persons requiring accommodation *
                  <input required type="number" min={1} max={Math.max(1, Number(form.partySize) || 1)} step={1} inputMode="numeric" value={form.accommodationPeople} onChange={(e) => update("accommodationPeople", e.target.value)} className={`${inputClass} max-w-xs`} />
                </label>
              </div>
            ) : null}
          </fieldset>

          <fieldset className="mt-8">
            <legend className="font-bold text-slate-900">Will you require directions or transportation guidance? *</legend>
            <div className="mt-3 flex gap-5">
              {(["yes", "no"] as const).map((choice) => (
                <label key={choice} className="flex items-center gap-2 font-medium text-slate-800">
                  <input required type="radio" name="needsTravelGuidance" value={choice} checked={form.needsTravelGuidance === choice} onChange={() => update("needsTravelGuidance", choice)} className="h-4 w-4 accent-fuchsia-700" />
                  {choice === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
            {form.needsTravelGuidance === "yes" ? (
              <label className="mt-5 block font-semibold text-slate-900">How do you plan to come? *
                <select required value={form.transportMode} onChange={(e) => update("transportMode", e.target.value)} className={inputClass}>
                  <option value="">Select an option</option>
                  {TRANSPORT_MODES.map((mode) => <option key={mode}>{mode}</option>)}
                </select>
              </label>
            ) : null}
          </fieldset>

          <label className="mt-8 block font-bold text-slate-900">How did you hear about the programme? <span className="font-normal text-slate-500">(optional)</span>
            <textarea maxLength={240} rows={3} value={form.referralSource} onChange={(e) => update("referralSource", e.target.value)} className={inputClass} />
          </label>

          <label className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-slate-800">
            <input required type="checkbox" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-fuchsia-700" />
            <span>I agree to receive programme information and important updates by WhatsApp/SMS. *</span>
          </label>

          {error ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div> : null}

          <button type="submit" disabled={submitting} className="mt-7 w-full rounded-xl bg-gradient-to-r from-fuchsia-700 to-purple-700 px-6 py-4 font-bold text-white shadow-sm transition hover:from-fuchsia-800 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Registering…" : "Register for Inaugural Service"}
          </button>
        </form>
      </section>
    </main>
  );
}
