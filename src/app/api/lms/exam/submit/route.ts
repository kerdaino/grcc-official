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
  const examId = body?.exam_id;
  const answers = body?.answers || {};
  const malpracticeFlags = Math.max(0, Number(body?.malpractice_flags) || 0);
  const allowExpiredSubmit = body?.allow_expired_submit === true;

  if (!examId) {
    return NextResponse.json({ ok: false, message: "Missing exam ID." }, { status: 400 });
  }

  const { data: exam, error: examError } = await supabaseServer
    .from("sod_exams")
    .select("id, is_published, duration_minutes")
    .eq("id", examId)
    .eq("is_published", true)
    .maybeSingle();

  if (examError) {
    return NextResponse.json({ ok: false, message: examError.message }, { status: 500 });
  }

  if (!exam) {
    return NextResponse.json({ ok: false, message: "Final exam not found." }, { status: 404 });
  }

  const durationMinutes =
    typeof exam.duration_minutes === "number" && exam.duration_minutes > 0
      ? exam.duration_minutes
      : 60;

  const { data: questions, error } = await supabaseServer
    .from("sod_exam_questions")
    .select("*")
    .eq("exam_id", examId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  const rows = questions || [];
  let score = 0;

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .select("id, score, total, started_at, submitted_at, malpractice_flags")
    .eq("exam_id", examId)
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
        message: "You have already completed this final exam.",
        score: submission.score || 0,
        total: submission.total || rows.length,
        already_submitted: true,
      },
      { status: 409 }
    );
  }

  let activeSubmission = submission;

  if (!activeSubmission) {
    const startedAt = new Date().toISOString();
    const { data: createdSubmission, error: createError } = await supabaseServer
      .from("sod_exam_submissions")
      .insert([
        {
          exam_id: examId,
          student_id: studentId,
          score: 0,
          total: rows.length,
          started_at: startedAt,
          malpractice_flags: malpracticeFlags,
        },
      ])
      .select("id, score, total, started_at, submitted_at, malpractice_flags")
      .single();

    if (createError || !createdSubmission) {
      return NextResponse.json(
        { ok: false, message: createError?.message || "Failed to create submission." },
        { status: 500 }
      );
    }

    activeSubmission = createdSubmission;
  }

  const startedAt = activeSubmission.started_at || new Date().toISOString();
  const deadline = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;

  if (Number.isNaN(deadline)) {
    return NextResponse.json({ ok: false, message: "Invalid exam timing data." }, { status: 500 });
  }

  if (Date.now() > deadline && !allowExpiredSubmit) {
    return NextResponse.json(
      { ok: false, message: "Final exam time has expired." },
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
    .from("sod_exam_answers")
    .delete()
    .eq("submission_id", activeSubmission.id);

  if (deleteAnswersError) {
    return NextResponse.json({ ok: false, message: deleteAnswersError.message }, { status: 500 });
  }

  const { error: answersError } = await supabaseServer
    .from("sod_exam_answers")
    .insert(answerRows);

  if (answersError) {
    return NextResponse.json({ ok: false, message: answersError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseServer
    .from("sod_exam_submissions")
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
