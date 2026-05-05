import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

type ExamQuestion = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: string | null;
};

type ExamAnswer = {
  selected_option: string | null;
  is_correct: boolean | null;
  sod_exam_questions: ExamQuestion | ExamQuestion[] | null;
};

function getJoinedQuestion(answer: ExamAnswer) {
  const question = answer.sod_exam_questions;

  return Array.isArray(question) ? question[0] : question;
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get("exam_id");

  if (!examId) {
    return NextResponse.json({ ok: false, message: "Missing exam ID." }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .select("id, exam_id, score, total, submitted_at")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (submissionError) {
    return NextResponse.json({ ok: false, message: submissionError.message }, { status: 500 });
  }

  if (!submission) {
    return NextResponse.json({ ok: false, message: "Result not found." }, { status: 404 });
  }

  if (!submission.submitted_at) {
    return NextResponse.json(
      { ok: false, message: "Result review is available only after submission." },
      { status: 409 }
    );
  }

  const { data: answers, error: answersError } = await supabaseServer
    .from("sod_exam_answers")
    .select(`
      selected_option,
      is_correct,
      sod_exam_questions (
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option
      )
    `)
    .eq("submission_id", submission.id);

  if (answersError) {
    return NextResponse.json({ ok: false, message: answersError.message }, { status: 500 });
  }

  const review = ((answers || []) as unknown as ExamAnswer[])
    .filter((answer) => getJoinedQuestion(answer))
    .map((answer) => {
      const question = getJoinedQuestion(answer)!;

      return {
        question_id: question.id,
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        selected_option: String(answer.selected_option || "").toUpperCase() || null,
        correct_option: String(question.correct_option || "").toUpperCase() || null,
        is_correct: !!answer.is_correct,
      };
    });

  return NextResponse.json({
    ok: true,
    submission: {
      exam_id: submission.exam_id,
      score: submission.score || 0,
      total: submission.total || review.length,
      submitted_at: submission.submitted_at,
    },
    review,
  });
}
