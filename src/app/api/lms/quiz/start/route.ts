import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const quizId = body?.quiz_id;

  if (!quizId) {
    return NextResponse.json({ ok: false, message: "Missing quiz ID." }, { status: 400 });
  }

  const { data: quiz, error: quizError } = await supabaseServer
    .from("sod_quizzes")
    .select("id, is_published, duration_minutes, available_until")
    .eq("id", quizId)
    .maybeSingle();

  if (quizError) {
    return NextResponse.json({ ok: false, message: quizError.message }, { status: 500 });
  }

  if (!quiz || !quiz.is_published) {
    return NextResponse.json({ ok: false, message: "Quiz not found." }, { status: 404 });
  }

  const availableUntilMs = quiz.available_until
    ? new Date(quiz.available_until).getTime()
    : Number.NaN;

  if (Number.isNaN(availableUntilMs) || Date.now() > availableUntilMs) {
    return NextResponse.json(
      { ok: false, message: "This quiz is no longer available." },
      { status: 409 }
    );
  }

  const { data: questions, error: questionsError } = await supabaseServer
    .from("sod_quiz_questions")
    .select("id")
    .eq("quiz_id", quizId);

  if (questionsError) {
    return NextResponse.json({ ok: false, message: questionsError.message }, { status: 500 });
  }

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_quiz_submissions")
    .select("id, quiz_id, score, total, started_at, submitted_at, malpractice_flags")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (submissionError) {
    return NextResponse.json({ ok: false, message: submissionError.message }, { status: 500 });
  }

  if (submission?.submitted_at) {
    return NextResponse.json(
      {
        ok: false,
        message: "You have already completed this quiz.",
        score: submission.score || 0,
        total: submission.total || (questions || []).length,
        already_submitted: true,
      },
      { status: 409 }
    );
  }

  if (submission) {
    return NextResponse.json({ ok: true, submission });
  }

  const startedAt = new Date().toISOString();
  const { data: createdSubmission, error: createError } = await supabaseServer
    .from("sod_quiz_submissions")
    .insert([
      {
        quiz_id: quizId,
        student_id: studentId,
        score: 0,
        total: (questions || []).length,
        started_at: startedAt,
        malpractice_flags: 0,
      },
    ])
    .select("id, quiz_id, score, total, started_at, submitted_at, malpractice_flags")
    .single();

  if (createError || !createdSubmission) {
    return NextResponse.json(
      { ok: false, message: createError?.message || "Failed to start quiz." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, submission: createdSubmission });
}
