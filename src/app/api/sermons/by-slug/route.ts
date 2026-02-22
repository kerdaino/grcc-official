import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { slug } = await req.json();

  if (!slug) {
    return NextResponse.json({ ok: false, message: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("sermons")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: error?.message || "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, row: data });
}