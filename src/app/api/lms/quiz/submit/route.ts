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
  const answers = body?.answers || {};
  const malpracticeFlags = Math.max(0, Number(body?.malpractice_flags) || 0);
  const allowExpiredSubmit = body?.allow_expired_submit === true;

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

  const durationMinutes =
    typeof quiz.duration_minutes === "number" && quiz.duration_minutes > 0
      ? quiz.duration_minutes
      : 20;
  const availableUntilMs = quiz.available_until
    ? new Date(quiz.available_until).getTime()
    : Number.NaN;
  const isAvailabilityWindowOpen =
    !Number.isNaN(availableUntilMs) && Date.now() <= availableUntilMs;

  const { data: questions, error } = await supabaseServer
    .from("sod_quiz_questions")
    .select("*")
    .eq("quiz_id", quizId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const rows = questions || [];
  let score = 0;

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_quiz_submissions")
    .select("id, score, total, started_at, submitted_at, malpractice_flags")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (submissionError) {
    return NextResponse.json(
      { ok: false, message: submissionError.message },
      { status: 500 }
    );
  }

  if (submission?.submitted_at) {
    return NextResponse.json(
      {
        ok: false,
        message: "You have already completed this quiz.",
        score: submission.score || 0,
        total: submission.total || rows.length,
        already_submitted: true,
      },
      { status: 409 }
    );
  }

  let activeSubmission = submission;

  if (!activeSubmission) {
    return NextResponse.json(
      {
        ok: false,
        message: isAvailabilityWindowOpen
          ? "Quiz has not been started."
          : "This quiz is no longer available.",
      },
      { status: 409 }
    );
  }

  const startedAt = activeSubmission.started_at || new Date().toISOString();
  const deadline =
    new Date(startedAt).getTime() + durationMinutes * 60 * 1000;

  if (Number.isNaN(deadline)) {
    return NextResponse.json({ ok: false, message: "Invalid quiz timing data." }, { status: 500 });
  }

  if (Date.now() > deadline && !allowExpiredSubmit) {
    return NextResponse.json(
      { ok: false, message: "Quiz time has expired." },
      { status: 409 }
    );
  }

  const answerRows = rows.map((q) => {
    const selected = String(answers[q.id] || "").toUpperCase();
    const correct = String(q.correct_option || "").toUpperCase();
    const isCorrect = selected && selected === correct;

    if (isCorrect) score += 1;

    return {
      submission_id: activeSubmission.id,
      question_id: q.id,
      selected_option: selected || "",
      is_correct: !!isCorrect,
    };
  });

  const { error: deleteAnswersError } = await supabaseServer
    .from("sod_quiz_answers")
    .delete()
    .eq("submission_id", activeSubmission.id);

  if (deleteAnswersError) {
    return NextResponse.json({ ok: false, message: deleteAnswersError.message }, { status: 500 });
  }

  const { error: answersError } = await supabaseServer
    .from("sod_quiz_answers")
    .insert(answerRows);

  if (answersError) {
    return NextResponse.json({ ok: false, message: answersError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseServer
    .from("sod_quiz_submissions")
    .update({
      score,
      total: rows.length,
      started_at: startedAt,
      submitted_at: new Date().toISOString(),
      malpractice_flags: Math.max(
        malpracticeFlags,
        Number(activeSubmission.malpractice_flags) || 0
      ),
    })
    .eq("id", activeSubmission.id)
    .is("submitted_at", null);

  if (updateError) {
    return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    score,
    total: rows.length,
    submitted_at: new Date().toISOString(),
    malpractice_flags: Math.max(
      malpracticeFlags,
      Number(activeSubmission.malpractice_flags) || 0
    ),
  });
}
