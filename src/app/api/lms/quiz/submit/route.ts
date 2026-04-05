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

  if (!quizId) {
    return NextResponse.json({ ok: false, message: "Missing quiz ID." }, { status: 400 });
  }

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
    .insert([
      {
        quiz_id: quizId,
        student_id: studentId,
        score: 0,
        total: rows.length,
      },
    ])
    .select("id")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json(
      { ok: false, message: submissionError?.message || "Failed to create submission." },
      { status: 500 }
    );
  }

  const answerRows = rows.map((q) => {
    const selected = String(answers[q.id] || "").toUpperCase();
    const correct = String(q.correct_option || "").toUpperCase();
    const isCorrect = selected && selected === correct;

    if (isCorrect) score += 1;

    return {
      submission_id: submission.id,
      question_id: q.id,
      selected_option: selected || "",
      is_correct: !!isCorrect,
    };
  });

  const { error: answersError } = await supabaseServer
    .from("sod_quiz_answers")
    .insert(answerRows);

  if (answersError) {
    return NextResponse.json({ ok: false, message: answersError.message }, { status: 500 });
  }

  const { error: updateError } = await supabaseServer
    .from("sod_quiz_submissions")
    .update({ score })
    .eq("id", submission.id);

  if (updateError) {
    return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    score,
    total: rows.length,
  });
}