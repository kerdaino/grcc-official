import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isWatchHourAdmin } from "@/lib/watchHourAdmin";
import {
  filterWatchHour, hasOption, LODGING_STATUS, UUID, WATCH_HOUR_TABLE, WELFARE_STATUS, watchHourCsv,
  type WatchHourRegistration,
} from "@/lib/watchHour";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
const columns = "id,registration_reference,full_name,phone,email,location,attendance_mode,attendance_duration,attendance_dates,party_size,physical_count,online_count,accommodation_preference,accommodation_arrival,accommodation_departure,accommodation_people,accommodation_men,accommodation_women,accommodation_family,accommodation_status,accessibility_request,needs_travel_guidance,arrival_info,welfare_status,communication_consent,created_at,updated_at";
const fail = (message: string, status: number) => NextResponse.json({ message }, { status, headers });

async function readRegistrations(filters?: URLSearchParams) {
  const rows: WatchHourRegistration[] = [];
  const pageSize = 500;
  for (;;) {
    // Read subsequent pages from the last stable sort key, even as new registrations arrive.
    const last = rows.at(-1);
    let query = supabaseServer.from(WATCH_HOUR_TABLE).select(columns)
      .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(pageSize);
    if (last) query = query.or(`created_at.lt.${last.created_at},and(created_at.eq.${last.created_at},id.lt.${last.id})`);
    const { data, error } = await query;
    if (error) {
      console.error("Watch-Hour admin read failed", { code: error.code });
      return fail("Could not load camp registrations.", 503);
    }
    if (!data.length) break;
    rows.push(...data as WatchHourRegistration[]);
  }

  if (filters) {
    return new NextResponse("\uFEFF" + watchHourCsv(filterWatchHour(rows, filters)), {
      headers: {
        ...headers, "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="grcc-december-watch-hour-2026.csv"',
      },
    });
  }
  return NextResponse.json({ rows }, { headers });
}

function sameOriginJson(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return request.headers.get("content-type")?.split(";")[0].trim() === "application/json" &&
    (fetchSite ? fetchSite === "same-origin" : !!origin &&
      (origin === new URL(request.url).origin || origin === process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")));
}

export async function GET() {
  if (!await isWatchHourAdmin()) return fail("Sign in again to access camp registrations.", 401);
  return readRegistrations();
}

export async function POST(request: Request) {
  if (!await isWatchHourAdmin()) return fail("Sign in again to export camp registrations.", 401);
  if (!sameOriginJson(request)) return fail("Invalid request origin.", 403);
  const body = await request.json().catch(() => null);
  const filters = new URLSearchParams();
  for (const key of ["q", "mode", "date", "accommodation", "followUp"]) {
    if (typeof body?.[key] === "string") filters.set(key, body[key].slice(0, 160));
  }
  return readRegistrations(filters);
}

export async function PATCH(request: Request) {
  if (!await isWatchHourAdmin()) return fail("Sign in again to update camp registrations.", 401);
  if (!sameOriginJson(request)) return fail("Invalid request origin.", 403);

  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string" || !UUID.test(body.id) ||
      !["accommodation_status", "welfare_status"].includes(body.field) ||
      typeof body.updated_at !== "string" || !Number.isFinite(Date.parse(body.updated_at))) {
    return fail("Invalid registration update.", 400);
  }

  let query;
  const updated_at = new Date().toISOString();
  if (body.field === "accommodation_status" && hasOption(LODGING_STATUS, body.value)) {
    query = supabaseServer.from(WATCH_HOUR_TABLE)
      .update({ accommodation_status: body.value, updated_at }).eq("accommodation_preference", "church");
  } else if (body.field === "welfare_status" && body.value !== "none" && hasOption(WELFARE_STATUS, body.value)) {
    query = supabaseServer.from(WATCH_HOUR_TABLE)
      .update({ welfare_status: body.value, updated_at }).neq("welfare_status", "none");
  } else {
    return fail("Choose a valid status.", 400);
  }

  const { data, error } = await query.eq("id", body.id).eq("updated_at", body.updated_at).select(columns).maybeSingle();
  if (error) {
    console.error("Watch-Hour admin update failed", { code: error.code });
    return fail("Could not save changes.", 503);
  }
  if (!data) return fail("The registration changed or cannot be updated. Refresh and try again.", 409);
  return NextResponse.json({ row: data }, { headers });
}
