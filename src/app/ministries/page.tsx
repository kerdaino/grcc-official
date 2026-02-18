"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";
import Link from "next/link";

export default function WorkforcePage() {
  const [tab, setTab] = useState<"login" | "apply">("login");
  const [submitted, setSubmitted] = useState(false);

  function fakeLogin(e: React.FormEvent) {
    e.preventDefault();
    alert("Login is disabled for now. (We will connect backend later.)");
  }

  function fakeApply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main>
      <PageHero
        title="Ministries"
        subtitle="Join the workforce and serve with us. Workers will receive login access after approval."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">
          {/* Left: Info */}
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Serve With Us
            </h2>

            <p className="mt-4 text-slate-700 leading-relaxed">
              The workforce is for members who desire to serve faithfully in a department.
              After applying, your application will be reviewed. If accepted, you will receive
              login access to your workforce dashboard (where your group link and updates will be).
            </p>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Apply to join a department.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Leaders review and approve.
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 mt-1">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Approved workers receive login credentials.
              </li>
            </ul>

            <div className="mt-8 rounded-xl border bg-white p-6">
              <p className="text-sm text-slate-600">
                For now, login is hidden/disabled until backend is ready.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setTab("apply")}
                className="rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Apply to Join
              </button>
              <button
                onClick={() => setTab("login")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-slate-900 font-semibold hover:bg-slate-100"
              >
                Worker Login
              </button>
            </div>
          </div>

          {/* Right: Login / Apply card */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {tab === "login" ? "Worker Login" : "Workforce Application"}
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setTab("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    tab === "login"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  Login
                </button>

                <button
                  onClick={() => setTab("apply")}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    tab === "apply"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>

            {tab === "login" ? (
              <form onSubmit={fakeLogin} className="mt-6 space-y-4">
                <input
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                  placeholder="Email Address"
                  type="email"
                />
                <input
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                  placeholder="Password"
                  type="password"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700"
                >
                  Sign In
                </button>

                <p className="text-xs text-slate-500">
                  Login is disabled for now. After approval, you’ll receive login credentials.
                </p>
              </form>
            ) : (
              <>
                {submitted ? (
                  <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-teal-900">
                    ✅ Application submitted! (Frontend demo)
                    <p className="mt-2 text-sm text-teal-900/80">
                      Later, you’ll receive an email if accepted, and login credentials.
                    </p>
                  </div>
                ) : null}

                <form onSubmit={fakeApply} className="mt-6 space-y-4">
                  <input
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                    placeholder="Full Name"
                  />
                  <input
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                    placeholder="Email Address"
                    type="email"
                  />
                  <input
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                    placeholder="Phone Number / WhatsApp"
                  />

                  <select className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 bg-white">
                    <option value="">Select Department</option>
                    <option>Media / Tech</option>
                    <option>Protocol</option>
                    <option>Choir</option>
                    <option>Ushering</option>
                    <option>Children / Teens</option>
                    <option>Evangelism</option>
                    <option>Follow-Up</option>
                    <option>Welfare</option>
                    <option>Security</option>
                  </select>

                  <textarea
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 min-h-[130px]"
                    placeholder="Why do you want to join this workforce?"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
                  >
                    Submit Application
                  </button>

                  <p className="text-xs text-slate-500">
                    Backend (approval + email + login) will be added later.
                  </p>
                </form>
              </>
            )}

            <div className="mt-8 border-t pt-5 text-sm text-slate-600">
              Already a worker?{" "}
              <Link href="/contact" className="text-teal-700 font-semibold hover:underline">
                Contact admin
              </Link>{" "}
              if you can’t access your account yet.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
