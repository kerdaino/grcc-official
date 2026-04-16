import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

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

  const durationMinutes =
    typeof exam.duration_minutes === "number" && exam.duration_minutes > 0
      ? exam.duration_minutes
      : 60;

  const { data: questions, error: qError } = await supabaseServer
    .from("sod_exam_questions")
    .select("id, question, option_a, option_b, option_c, option_d")
    .eq("exam_id", exam.id)
    .order("created_at", { ascending: true });

  if (qError) {
    return NextResponse.json({ ok: false, message: qError.message }, { status: 500 });
  }

  const rows = questions || [];

  const { data: existingSubmission, error: submissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .select("id, score, total, started_at, submitted_at, malpractice_flags")
    .eq("exam_id", exam.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (submissionError) {
    return NextResponse.json({ ok: false, message: submissionError.message }, { status: 500 });
  }

  let submission = existingSubmission;

  if (!submission) {
    const startedAt = new Date().toISOString();

    const { data: createdSubmission, error: createError } = await supabaseServer
      .from("sod_exam_submissions")
      .insert([
        {
          exam_id: exam.id,
          student_id: studentId,
          score: 0,
          total: rows.length,
          started_at: startedAt,
          malpractice_flags: 0,
        },
      ])
      .select("id, score, total, started_at, submitted_at, malpractice_flags")
      .single();

    if (createError) {
      return NextResponse.json({ ok: false, message: createError.message }, { status: 500 });
    }

    submission = createdSubmission;
  }

  return NextResponse.json({
    ok: true,
    exam: {
      ...exam,
      duration_minutes: durationMinutes,
    },
    questions: rows,
    submission: submission || null,
    already_submitted: !!submission?.submitted_at,
  });
}
