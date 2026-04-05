import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data: exam, error: examError } = await supabaseServer
    .from("sod_exams")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (examError) {
    return NextResponse.json({ ok: false, message: examError.message }, { status: 500 });
  }

  if (!exam) {
    return NextResponse.json({ ok: true, exam: null, questions: [] });
  }

  const { data: questions, error: qError } = await supabaseServer
    .from("sod_exam_questions")
    .select("id, question, option_a, option_b, option_c, option_d")
    .eq("exam_id", exam.id)
    .order("created_at", { ascending: true });

  if (qError) {
    return NextResponse.json({ ok: false, message: qError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, exam, questions: questions || [] });
}