import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("grcc_admin")?.value !== "1") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("grcc_inaugural_registrations")
    .select("id, registration_reference, full_name, phone, email, location, church_ministry, expected_sessions, party_size, needs_accommodation, accommodation_nights, accommodation_people, needs_travel_guidance, transport_mode, referral_source, communication_consent, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin inaugural registrations read failed", { code: error.code, message: error.message });
    return NextResponse.json({ ok: false, message: "Failed to load registrations." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rows: data ?? [] });
}
