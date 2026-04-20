import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const revalidate = 300;

export async function GET() {
  const { data, error } = await supabaseServer
    .from("sermons")
    .select("id,title,slug,preacher,sermon_date,summary,thumbnail_url")
    .eq("is_published", true)
    .order("sermon_date", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, rows: data || [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
