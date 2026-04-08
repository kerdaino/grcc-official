import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("sod_live_class")
      .select("id,title,zoom_link,meeting_id,passcode,instructions,is_live,is_published,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const row = data?.[0] || null;

    return NextResponse.json({
      ok: true,
      row,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Server error loading live class." },
      { status: 500 }
    );
  }
}