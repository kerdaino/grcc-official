import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const nowIso = new Date().toISOString();
  const { data: activeSubmission, error: activeSubmissionError } = await supabaseServer
    .from("sod_quiz_submissions")
    .select("id, quiz_id, score, total, started_at, submitted_at, malpractice_flags")
    .eq("student_id", studentId)
    .is("submitted_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeSubmissionError) {
    return NextResponse.json({ ok: false, message: activeSubmissionError.message }, { status: 500 });
  }

  let quiz = null;

  if (activeSubmission?.quiz_id) {
    const { data: activeQuiz, error: activeQuizError } = await supabaseServer
      .from("sod_quizzes")
      .select("*")
      .eq("id", activeSubmission.quiz_id)
      .eq("is_published", true)
      .maybeSingle();

    if (activeQuizError) {
      return NextResponse.json({ ok: false, message: activeQuizError.message }, { status: 500 });
    }

    quiz = activeQuiz;
  }

  if (!quiz) {
    const { data: availableQuiz, error: quizError } = await supabaseServer
      .from("sod_quizzes")
      .select("*")
      .eq("is_published", true)
      .gt("available_until", nowIso)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (quizError) {
      return NextResponse.json({ ok: false, message: quizError.message }, { status: 500 });
    }

    quiz = availableQuiz;
  }

  if (!quiz) {
    return NextResponse.json({ ok: true, quiz: null, questions: [] });
  }

  const durationMinutes =
    typeof quiz.duration_minutes === "number" && quiz.duration_minutes > 0
      ? quiz.duration_minutes
      : 20;

  const { data: questions, error: qError } = await supabaseServer
    .from("sod_quiz_questions")
    .select("id, question, option_a, option_b, option_c, option_d")
    .eq("quiz_id", quiz.id)
    .order("created_at", { ascending: true });

  if (qError) {
    return NextResponse.json({ ok: false, message: qError.message }, { status: 500 });
  }

  const rows = questions || [];

  let submission = activeSubmission;

  if (!submission) {
    const { data: existingSubmission, error: submissionError } = await supabaseServer
      .from("sod_quiz_submissions")
      .select("id, quiz_id, score, total, started_at, submitted_at, malpractice_flags")
      .eq("quiz_id", quiz.id)
      .eq("student_id", studentId)
      .maybeSingle();

    if (submissionError) {
      return NextResponse.json({ ok: false, message: submissionError.message }, { status: 500 });
    }

    submission = existingSubmission;
  }

  return NextResponse.json({
    ok: true,
    quiz: {
      ...quiz,
      duration_minutes: durationMinutes,
    },
    questions: rows,
    submission: submission || null,
    already_submitted: !!submission?.submitted_at,
  });
}
