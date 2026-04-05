import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseServer
    .from("sod_exam_submissions")
    .select(`
      id,
      score,
      total,
      created_at,
      sod_exams (
        title
      ),
      sod_students (
        full_name,
        email,
        cohort
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, rows: data || [] });
}