import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  const { data: student } = await supabaseServer
    .from("sod_students")
    .select("id, full_name, email, cohort, status, payment_status, access_enabled")
    .eq("id", studentId)
    .single();

  if (!student || !student.access_enabled || student.payment_status !== "paid") {
    return NextResponse.json({ ok: true, authenticated: false });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    student,
  });
}