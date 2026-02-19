"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      setMsg(data?.message || "Login failed");
      return;
    }

    window.location.href = "/admin/school-of-discovery";
  }

  return (
    <main className="min-h-[70vh] bg-white">
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
        <p className="mt-2 text-slate-600 text-sm">
          GRCC — School of Discovery Admin
        </p>

        {msg ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {msg}
          </div>
        ) : null}

        <form onSubmit={login} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
            placeholder="Admin password"
          />
          <button className="w-full rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800">
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
