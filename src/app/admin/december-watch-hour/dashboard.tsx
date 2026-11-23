"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DAYS, DURATIONS, filterWatchHour, LODGING, LODGING_STATUS, MODES, summarizeWatchHour,
  WELFARE_STATUS, type WatchHourRegistration,
} from "@/lib/watchHour";

const endpoint = "/api/admin/december-watch-hour";
const control = "mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2";
const card = "rounded-2xl border bg-white p-4 shadow-sm sm:p-5";
const button = "inline-block rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-60";
const dateLabel = (date: string) => `${Number(date.slice(-2))} Dec`;

function Filter({ label, value, update, options }: {
  label: string;
  value: string;
  update: (value: string) => void;
  options: Record<string, string>;
}) {
  return <label className="block font-medium">{label}
    <select className={control} value={value} onChange={(event) => update(event.target.value)}>
      <option value="">All</option>
      {Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>;
}

export default function Dashboard() {
  const [rows, setRows] = useState<WatchHourRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("");
  const [date, setDate] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [followUp, setFollowUp] = useState("");
  const filters = useMemo(() => new URLSearchParams({ q: query, mode, date, accommodation, followUp }), [query, mode, date, accommodation, followUp]);
  const visible = useMemo(() => filterWatchHour(rows, filters), [rows, filters]);
  const summary = useMemo(() => summarizeWatchHour(rows), [rows]);
  const selected = rows.find((row) => row.id === selectedId);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) setExpired(true);
      if (!response.ok) throw new Error(result.message);
      setRows(result.rows);
      setLoaded(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(filters)),
      });
      if (response.status === 401) setExpired(true);
      if (!response.ok) throw new Error("Could not export registrations.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "grcc-december-watch-hour-2026.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not export registrations.");
    } finally {
      setExporting(false);
    }
  }

  async function update(row: WatchHourRegistration, field: "accommodation_status" | "welfare_status", value: string) {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, updated_at: row.updated_at, field, value }),
      });
      const result = await response.json();
      if (response.status === 401) setExpired(true);
      if (!response.ok) throw new Error(result.message);
      setRows((current) => current.map((item) => item.id === row.id ? result.row : item));
      setStatus("Status saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save status.");
    } finally {
      setSaving(false);
    }
  }

  if (expired) return <p className="p-8 text-center"><Link href="/admin" className="underline">Sign in again</Link> to view camp registrations.</p>;

  return <section className="bg-slate-50 px-4 py-8">
    <div className="mx-auto max-w-7xl min-w-0 space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className={button} disabled={loading || saving} onClick={() => void load()}>Refresh registrations</button>
        {loading && <p role="status">Loading registrations…</p>}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
      {loaded && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(summary.totals).map(([label, count]) => <div key={label} className={card}>
            <p className="font-medium text-slate-700">{label}</p><p className="mt-1 text-3xl font-extrabold">{count}</p>
          </div>)}
        </div>
        <p className="text-slate-700">People who plan to attend both ways appear in both mode totals and once in their party’s unique count. Unique estimates are summed across registrations.</p>

        <div className={card}>
          <details>
            <summary className="cursor-pointer text-xl font-bold">Expected attendance and overnight occupancy by day</summary>
            <p className="mt-3 text-slate-700">{summary.uncertain} people with tentative dates are excluded from daily attendance estimates. Parties’ mode counts apply to each registered day. Overnight estimates exclude departure nights and declined requests.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[670px] text-left">
                <thead><tr className="border-b">
                  {["Date", "Unique", "Physical", "Online", "Pending beds", "Confirmed beds"].map((heading) =>
                    <th className="p-2" scope="col" key={heading}>{heading}</th>)}
                </tr></thead>
                <tbody>{summary.daily.map((day) => <tr key={day.date} className="border-b">
                  <th className="p-2" scope="row">{dateLabel(day.date)}</th>
                  {[day.unique, day.physical, day.online, day.pending, day.confirmed].map((count, index) =>
                    <td className="p-2 tabular-nums" key={index}>{count}</td>)}
                </tr>)}</tbody>
              </table>
            </div>
          </details>
        </div>

        <div className={card}>
          <h2 className="mb-4 text-xl font-bold">Registrations</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block font-medium">Search<input className={control} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, phone or reference" /></label>
            <Filter label="Attendance mode" options={MODES} value={mode} update={setMode} />
            <Filter label="Attendance date" options={Object.fromEntries(DAYS.map((day) => [day, dateLabel(day)]))} value={date} update={setDate} />
            <Filter label="Accommodation" options={{ church: "Church", hotel: "Hotel or guesthouse", commute: "Commute", undecided: "Undecided", none: "Online only" }} value={accommodation} update={setAccommodation} />
            <Filter label="Welfare follow-up" options={WELFARE_STATUS} value={followUp} update={setFollowUp} />
          </div>
          <div className="my-4 flex flex-wrap items-center justify-between gap-3">
            <p>Showing {visible.length} of {rows.length} registrations</p>
            {visible.length > 0 && <button type="button" className={button} disabled={exporting} onClick={() => void exportCsv()}>{exporting ? "Exporting…" : "Export filtered CSV"}</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b">
                {["Name and reference", "Mode", "Party", "Welfare and protocol", "Details"].map((heading) =>
                  <th className="p-2" scope="col" key={heading}>{heading}</th>)}
              </tr></thead>
              <tbody>{visible.map((row) => <tr key={row.id} className="border-b">
                <th className="p-2" scope="row">{row.full_name}<div className="font-normal text-slate-600">{row.registration_reference}</div></th>
                <td className="p-2">{MODES[row.attendance_mode]}</td><td className="p-2">{row.party_size}</td>
                <td className="p-2">
                  <p>{WELFARE_STATUS[row.welfare_status]}</p>
                  {row.accommodation_status && <p>{row.accommodation_people} beds · {LODGING_STATUS[row.accommodation_status]}</p>}
                  {row.needs_travel_guidance && <p>Travel guidance requested</p>}
                  {row.accessibility_request && <p>Accessibility logistics requested</p>}
                </td>
                <td className="p-2"><button type="button" className="font-semibold text-fuchsia-800 underline"
                  aria-label={`View ${row.full_name}, ${row.registration_reference}`} onClick={() => {
                    setSelectedId(row.id);
                    setStatus("");
                    requestAnimationFrame(() => document.getElementById("registration-details")?.focus());
                  }}>View</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>

        {selected && <div className={card}>
          <h2 id="registration-details" tabIndex={-1} className="text-xl font-bold">{selected.full_name} · {selected.registration_reference}</h2>
          <dl className="my-4 grid gap-4 break-words sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Phone", selected.phone], ["Email", selected.email], ["Residence", selected.location],
              ["Attendance mode", MODES[selected.attendance_mode]], ["Duration", DURATIONS[selected.attendance_duration]],
              ["Dates", selected.attendance_dates.map(dateLabel).join(", ")],
              ["Unique party size", selected.party_size], ["Physical", selected.physical_count], ["Online", selected.online_count],
              ["Joining both ways", selected.physical_count + selected.online_count - selected.party_size],
              ["Accommodation preference", selected.accommodation_preference && LODGING[selected.accommodation_preference]],
              ["Lodging arrival", selected.accommodation_arrival], ["Lodging departure", selected.accommodation_departure],
              ["Sleeping spaces requested", selected.accommodation_people],
              ["Men / women / family or group", selected.accommodation_people ? `${selected.accommodation_men} / ${selected.accommodation_women} / ${selected.accommodation_family}` : null],
              ["Accessibility logistics", selected.accessibility_request], ["Travel guidance", selected.needs_travel_guidance ? "Yes" : "No"],
              ["Arrival information", selected.arrival_info], ["Event updates consent", selected.communication_consent ? "Yes" : "No"],
              ["Registered (WAT)", new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(selected.created_at))],
            ].map(([label, value]) => <div className="min-w-0" key={label}><dt className="font-semibold">{label}</dt><dd>{value ?? "—"}</dd></div>)}
          </dl>
          <fieldset disabled={saving || loading} className="grid gap-4 sm:grid-cols-2">
            {selected.accommodation_status && <label className="font-semibold">Accommodation confirmation
              <select className={control} value={selected.accommodation_status} onChange={(event) => void update(selected, "accommodation_status", event.target.value)}>
                {Object.entries(LODGING_STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>}
            {selected.welfare_status !== "none" && <label className="font-semibold">Welfare follow-up
              <select className={control} value={selected.welfare_status} onChange={(event) => void update(selected, "welfare_status", event.target.value)}>
                {Object.entries(WELFARE_STATUS).filter(([key]) => key !== "none").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>}
          </fieldset>
          {saving && <p className="mt-3" role="status">Saving status…</p>}
          {status && <p className="mt-3" role="status">{status}</p>}
          {error && <p className="mt-3 text-red-800">{error}</p>}
        </div>}
      </>}
    </div>
  </section>;
}
