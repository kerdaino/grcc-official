"use client";

import { useState } from "react";
import PageHero from "@/components/PageHero";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!password.trim()) {
      setMsg("Please enter the admin password.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.ok) {
      setMsg(data?.message || "Login failed");
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <main>
      <PageHero
        title="Admin Login"
        subtitle="Sign in to access the GRCC admin dashboard."
      />

      <section className="min-h-[60vh] bg-white">
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter the admin password to continue.
            </p>

            {msg ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {msg}
              </div>
            ) : null}

            <form onSubmit={login} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter admin password"
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}