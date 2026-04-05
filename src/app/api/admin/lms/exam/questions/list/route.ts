import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { exam_id } = await req.json();

  if (!exam_id) {
    return NextResponse.json({ ok: false, message: "Missing exam ID." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("sod_exam_questions")
    .select("*")
    .eq("exam_id", exam_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rows: data || [] });
}