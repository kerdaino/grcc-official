import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { isWatchHourAdmin } from "@/lib/watchHourAdmin";

const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  if (!await isWatchHourAdmin()) {
    return NextResponse.json({ ok: false, message: "Your admin session has expired. Sign in again to view registrations." }, { status: 401, headers });
  }

  const { data, error } = await supabaseServer
    .from("grcc_inaugural_registrations")
    .select("id, registration_reference, full_name, phone, email, location, church_ministry, expected_sessions, party_size, needs_accommodation, accommodation_nights, accommodation_people, needs_travel_guidance, transport_mode, referral_source, communication_consent, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin inaugural registrations read failed", { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, message: "Failed to load registrations." }, { status: 500, headers });
  }

  return NextResponse.json({ ok: true, rows: data ?? [] }, { headers });
}
