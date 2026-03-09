"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // This will later connect to backend
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.message || "Unable to send message.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <PageHero
        title="Contact"
        subtitle="We’d love to hear from you. Reach us or send a message."
        image="/images/contact.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            <div className="rounded-2xl border bg-slate-50 p-7">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Contact Details
              </h3>

              <div className="mt-5 space-y-4 text-slate-700">

                <div className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <p>
                    Behind Make-Up Quarters, Oshola Junction, Near Oyemekun Bus Stop,
                    College Road, Ogba, Lagos, Nigeria.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <p>+234 703 668 2410</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-envelope" />
                  </span>
                  <p>gloryrealm2025@gmail.com</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-clock" />
                  </span>
                  <p>Sun: 09:00 AM | Thu: 5:30 PM</p>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-7">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Directions
              </h3>

              <p className="mt-3 text-slate-600">
                Use Google Maps to get directions to the church location.
              </p>

              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700"
              >
                <i className="fa-solid fa-location-crosshairs" />
                Get Directions
              </a>
            </div>

          </div>

          {/* RIGHT SIDE FORM */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Send a Message
            </h3>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                ✅ Message sent successfully. We will get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                placeholder="Full Name"
              />

              <input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                placeholder="Email Address"
                type="email"
              />

              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                placeholder="Phone Number"
              />

              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                placeholder="Your Message"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

            </form>
          </div>
        </div>
      </section>
    </main>
  );
}