"use client";

import { useState } from "react";

export default function LMSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/lms/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setMsg(data?.message || "Login failed.");
        setLoading(false);
        return;
      }

      window.location.href = "/lms/dashboard";
    } catch {
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
            GRCC LMS
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Student Login
          </h1>
          <p className="mt-2 text-slate-600">
            Access your School of Discovery dashboard, class schedule, recordings, quizzes, and final exam.
          </p>

          {msg ? (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {msg}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}