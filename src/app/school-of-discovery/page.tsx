"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function SchoolOfDiscoveryPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main>
      <PageHero
        title="School of Discovery"
        subtitle="Register for the School of Discovery. After submission, you’ll receive a confirmation email, and later an admission update."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">
          {/* Info */}
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Registration Information
            </h2>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Fill the form accurately.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                You will get an email after successful submission.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                You will later receive admission status (admitted / not admitted).
              </li>
            </ul>

            <div className="mt-8 rounded-xl bg-white p-6 border">
              <p className="text-slate-600 text-sm">
                Backend will handle:
                <br />• Saving registration into database
                <br />• Sending confirmation email
                <br />• Admin reviewing applications + sending admission decision
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Register Now
            </h3>

            {submitted ? (
              <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-teal-900">
                ✅ Submission received! (Frontend demo)
                <p className="mt-2 text-sm text-teal-900/80">
                  Later, backend will email you automatically.
                </p>
              </div>
            ) : null}

            <form className="mt-6 space-y-4">
              <input className="w-full rounded-lg border px-4 py-3" placeholder="Full Name" />
              <input className="w-full rounded-lg border px-4 py-3" placeholder="Email Address" type="email" />
              <input className="w-full rounded-lg border px-4 py-3" placeholder="Phone Number / WhatsApp" />
              <input className="w-full rounded-lg border px-4 py-3" placeholder="Address" />
              <select className="w-full rounded-lg border px-4 py-3">
                <option>Choose Class Type</option>
                <option>Physical</option>
                <option>Online</option>
              </select>
              <textarea className="w-full rounded-lg border px-4 py-3 min-h-[120px]" placeholder="Why do you want to join?" />

              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="w-full rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700"
              >
                Submit Registration
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
