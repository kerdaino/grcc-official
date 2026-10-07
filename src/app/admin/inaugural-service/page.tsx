"use client";

import PageHero from "@/components/PageHero";
import {
  filterInauguralRegistrations,
  INAUGURAL_SESSIONS,
  registrationsToCsv,
  summarizeInauguralRegistrations,
  type InauguralRegistration,
} from "@/lib/inauguralService";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function AdminInauguralServicePage() {
  const [rows, setRows] = useState<InauguralRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [session, setSession] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [travel, setTravel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inaugural-service/list", { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) throw new Error(data?.message || "Failed to load registrations.");
      setRows(data.rows ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const summary = useMemo(() => summarizeInauguralRegistrations(rows), [rows]);

  const visible = useMemo(() => {
    return filterInauguralRegistrations(rows, {
      query,
      session,
      accommodation: accommodation as "" | "true" | "false",
      travel: travel as "" | "true" | "false",
    });
  }, [rows, query, session, accommodation, travel]);

  function exportCsv() {
    const blob = new Blob(["\uFEFF", registrationsToCsv(visible)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grcc-inaugural-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const cards = [
    ["Total registrations", summary.registrations], ["Expected people", summary.people],
    ["Thursday attendance", summary.thursday], ["Friday attendance", summary.friday],
    ["Saturday attendance", summary.saturday], ["Sunday attendance", summary.sunday],
    ["Accommodation requests", summary.accommodation], ["Accommodation persons", summary.accommodationPeople],
    ["Travel / directions requests", summary.travel],
  ];

  return (
    <main>
      <PageHero title="Admin — Inaugural Service" subtitle="Review registrations and prepare attendance, accommodation, and travel support." />
      <section className="bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="xl:col-span-2"><span className="sr-only">Search registrations</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, or reference" className="w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:border-fuchsia-600" /></label>
              <label><span className="sr-only">Filter by session</span><select value={session} onChange={(e) => setSession(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-3 text-slate-900"><option value="">All sessions</option>{INAUGURAL_SESSIONS.filter((item) => item !== "All Sessions").map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span className="sr-only">Filter by accommodation</span><select value={accommodation} onChange={(e) => setAccommodation(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-3 text-slate-900"><option value="">Any accommodation</option><option value="true">Accommodation: Yes</option><option value="false">Accommodation: No</option></select></label>
              <label><span className="sr-only">Filter by travel guidance</span><select value={travel} onChange={(e) => setTravel(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-3 text-slate-900"><option value="">Any travel guidance</option><option value="true">Travel guidance: Yes</option><option value="false">Travel guidance: No</option></select></label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Showing {visible.length} of {rows.length} registrations</p>
              <div className="flex gap-3"><button type="button" onClick={() => void load()} className="rounded-lg border px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50">Refresh</button><button type="button" onClick={exportCsv} disabled={visible.length === 0} className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-50">Export visible CSV</button></div>
            </div>
          </div>

          {error ? <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div> : null}

          <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            {loading ? <div className="p-8 text-slate-600">Loading registrations…</div> : visible.length === 0 ? <div className="p-8 text-slate-600">No registrations match the current filters.</div> : (
              <div className="overflow-x-auto">
                <table className="min-w-[1100px] w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr>{["Reference", "Name / phone", "Location", "Sessions", "Party", "Accommodation", "Travel guidance", "Registered"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-200">
                    {visible.map((row) => (
                      <tr key={row.id} className="align-top hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-4 font-bold text-fuchsia-700">{row.registration_reference}</td>
                        <td className="px-4 py-4"><p className="font-semibold text-slate-950">{row.full_name}</p><a href={`tel:${row.phone}`} className="mt-1 block text-slate-600 hover:underline">{row.phone}</a></td>
                        <td className="px-4 py-4 text-slate-700">{row.location}</td>
                        <td className="px-4 py-4 text-slate-700">{row.expected_sessions.join(", ")}</td>
                        <td className="px-4 py-4 font-semibold text-slate-950">{row.party_size}</td>
                        <td className="px-4 py-4 text-slate-700">{row.needs_accommodation ? `Yes — ${row.accommodation_people ?? 0} (${row.accommodation_nights.join(", ")})` : "No"}</td>
                        <td className="px-4 py-4 text-slate-700">{row.needs_travel_guidance ? `Yes — ${row.transport_mode}` : "No"}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(row.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
