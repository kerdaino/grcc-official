"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";
import Link from "next/link";

export default function WorkforcePage() {
  const [tab, setTab] = useState<"login" | "apply">("login");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function fakeLogin(e: React.FormEvent) {
    e.preventDefault();
    alert("Login is disabled for now. Workers will receive login access after approval.");
  }

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSubmitted(false);

    const formEl = e.target as HTMLFormElement;
    const formData = new FormData(formEl);

    const payload = {
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      department: formData.get("department"),
      reason: formData.get("reason"),
    };

    if (!payload.full_name || !payload.email || !payload.department || !payload.reason) {
      setMsg("Please fill all required fields.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/ministries/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Application failed");
      return;
    }

    setSubmitted(true);
    formEl.reset();
  }

  return (
    <main>
      <PageHero
        title="Ministries"
        subtitle="Join the workforce and serve with us. Workers will receive login access after approval."
        image="/images/min.png"
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Serve With Us
            </h2>

            <p className="mt-4 leading-relaxed text-slate-700">
              The workforce is for members who desire to serve faithfully in a
              department. After applying, your application will be reviewed. If
              accepted, you will receive login access to your workforce dashboard,
              where your group link and updates will be available.
            </p>

            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 text-teal-600">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Apply to join a department.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-teal-600">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Leaders review and approve.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-teal-600">
                  <i className="fa-solid fa-circle-check" />
                </span>
                Approved workers receive login credentials.
              </li>
            </ul>

            <div className="mt-8 rounded-xl border bg-white p-6">
              <p className="text-sm text-slate-700">
                Worker login will be enabled for approved workers. If you are newly
                joining the workforce, please submit your application first.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setTab("apply")}
                className="rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700"
              >
                Apply to Join
              </button>
              <button
                onClick={() => setTab("login")}
                className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-100"
              >
                Worker Login
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
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
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="Email Address"
                  type="email"
                />
                <input
                  className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="Password"
                  type="password"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Sign In
                </button>

                <p className="text-xs text-slate-600">
                  Login is currently available only to approved workers who have
                  received access details.
                </p>
              </form>
            ) : (
              <>
                {msg ? (
                  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    {msg}
                  </div>
                ) : null}

                {submitted ? (
                  <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-5 text-teal-900">
                    ✅ Thank you for applying to serve at GRCC.
                    <p className="mt-2 text-sm text-teal-900/90">
                      Your application will be reviewed by the leadership team.
                      If approved, you will receive your worker login details.
                    </p>
                  </div>
                ) : null}

                <form onSubmit={apply} className="mt-6 space-y-4">
                  <input
                    name="full_name"
                    className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Full Name"
                  />
                  <input
                    name="email"
                    className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Email Address"
                    type="email"
                  />
                  <input
                    name="phone"
                    className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Phone Number / WhatsApp"
                  />

                  <select
                    name="department"
                    className="w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    defaultValue=""
                  >
                    <option value="">Select Department</option>
                    <option value="Media / Tech">Media / Tech</option>
                    <option value="Protocol">Protocol</option>
                    <option value="Choir">Choir</option>
                    <option value="Ushering">Ushering</option>
                    <option value="Children / Teens">Children / Teens</option>
                    <option value="Evangelism">Evangelism</option>
                    <option value="Follow-Up">Follow-Up</option>
                    <option value="Welfare">Welfare</option>
                    <option value="Security">Security</option>
                  </select>

                  <textarea
                    name="reason"
                    className="min-h-[130px] w-full rounded-lg border px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Why do you want to join this workforce?"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-teal-600 px-5 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>

                  <p className="text-xs text-slate-600">
                    Applications are reviewed by leadership before worker access is
                    granted.
                  </p>
                </form>
              </>
            )}

            <div className="mt-8 border-t pt-5 text-sm text-slate-700">
              Already a worker?{" "}
              <Link
                href="/contact"
                className="font-semibold text-teal-700 hover:underline"
              >
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