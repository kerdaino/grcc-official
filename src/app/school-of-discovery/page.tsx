"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function SchoolOfDiscoveryPage() {
  const [submitted, setSubmitted] = useState(false);
const [loading, setLoading] = useState(false);

  // Frontend-only form state (backend later)
  const [form, setForm] = useState({
    fullName: "",
    addressOrCountry: "",
    dateOfBirth: "",
    salvationExperience: "",
    churchAttending: "",
    hasSpiritualCovering: "",
    isWorker: "",
    expectation: "",
    attendedBibleSchoolBefore: "",
    discipleshipInfo: "",
    email: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!form.fullName || !form.addressOrCountry || !form.dateOfBirth || !form.email) {
    alert("Please fill all required fields.");
    return;
  }

  setLoading(true);

  const payload = {
    name: form.fullName,
    address: form.addressOrCountry,
    date_of_birth: form.dateOfBirth,
    salvation_experience: form.salvationExperience,
    church_attending: form.churchAttending,
    spiritual_covering: form.hasSpiritualCovering,
    is_worker: form.isWorker,
    expectation: form.expectation,
    attended_bible_school: form.attendedBibleSchoolBefore,
    disciple_of: form.discipleshipInfo,
    email: form.email,
  };

  const res = await fetch("/api/school-of-discovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  setLoading(false);

  if (!res.ok || !data.ok) {
    alert(data?.message || "Submission failed.");
    return;
  }

  setSubmitted(true);
}


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
          </div>

          {/* Form */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Register Now
            </h3>

            {submitted ? (
              <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-teal-900">
                ✅ Your application has been submitted successfully.

<p className="mt-2 text-sm text-teal-900/90">
  Please check your email for confirmation. Our team will review your application and notify you of your admission status.
</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
  value={form.fullName}
  onChange={(e) => updateField("fullName", e.target.value)}
  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
  placeholder="Full name"
/>
              </div>
              <div>
               <label className="block text-sm font-semibold text-slate-900">
                  Email Address <span className="text-red-600">*</span>
                </label> 
              <input
  value={form.email}
  onChange={(e) => updateField("email", e.target.value)}
  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
  placeholder="Email Address"
  type="email"
/>
</div>
              {/* Address or Country */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Address or Country <span className="text-red-600">*</span>
                </label>
                <input
                  value={form.addressOrCountry}
                  onChange={(e) => updateField("addressOrCountry", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="Your address or country"
                />
              </div>

              {/* Date of birth */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Salvation experience */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Salvation Experience
                </label>
                <textarea
                  value={form.salvationExperience}
                  onChange={(e) => updateField("salvationExperience", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="Briefly share your salvation experience..."
                />
              </div>

              {/* Church attending */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Church Attending
                </label>
                <input
                  value={form.churchAttending}
                  onChange={(e) => updateField("churchAttending", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="Name of your church"
                />
              </div>

              {/* Spiritual covering */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Do you have spiritual covering?
                </label>
                <select
                  value={form.hasSpiritualCovering}
                  onChange={(e) => updateField("hasSpiritualCovering", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 bg-white text-slate-900"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Worker */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Are you a worker in your place of worship?
                </label>
                <select
                  value={form.isWorker}
                  onChange={(e) => updateField("isWorker", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 bg-white text-slate-900"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Expectation */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  What is your expectation?
                </label>
                <textarea
                  value={form.expectation}
                  onChange={(e) => updateField("expectation", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="What do you expect from School of Discovery?"
                />
              </div>

              {/* Have you attended any theological/bible/disciple school before */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Have you attended any theological, bible, or discipleship school before?
                </label>
                <select
                  value={form.attendedBibleSchoolBefore}
                  onChange={(e) => updateField("attendedBibleSchoolBefore", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 bg-white text-slate-900"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Who is a disciple */}
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Who is a disciple?
                </label>
                <textarea
                  value={form.discipleshipInfo}
                  onChange={(e) => updateField("discipleshipInfo", e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="In your understanding, who is a disciple?"
                />
              </div>

              <button
  type="submit"
  disabled={loading}
  className="w-full rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700 disabled:opacity-60"
>
  {loading ? "Submitting..." : "Submit Registration"}
</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
