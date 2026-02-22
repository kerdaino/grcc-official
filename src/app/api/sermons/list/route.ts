import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data, error } = await supabaseServer
    .from("sermons")
    .select("id,created_at,title,slug,preacher,sermon_date,scripture,summary,youtube_url,thumbnail_url,is_published")
    .eq("is_published", true)
    .order("sermon_date", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rows: data || [] });
}