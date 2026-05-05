import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

type ExamReviewAnswer = {
  selected_option: string | null;
  is_correct: boolean | null;
  sod_exam_questions: {
    id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string | null;
    option_d: string | null;
    correct_option: string | null;
  } | {
    id: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string | null;
    option_d: string | null;
    correct_option: string | null;
  }[] | null;
};

function getOptionText(
  question: Exclude<NonNullable<ExamReviewAnswer["sod_exam_questions"]>, unknown[]>,
  option: string | null
) {
  const normalized = String(option || "").toUpperCase();

  if (normalized === "A") return question.option_a;
  if (normalized === "B") return question.option_b;
  if (normalized === "C") return question.option_c;
  if (normalized === "D") return question.option_d;

  return null;
}

function getJoinedQuestion(answer: ExamReviewAnswer) {
  const question = answer.sod_exam_questions;

  return Array.isArray(question) ? question[0] : question;
}

async function getExamReview(submissionId: string) {
  const { data: answers, error } = await supabaseServer
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
    .eq("submission_id", submissionId);

  if (error) {
    return { review: null, error };
  }

  const review = ((answers || []) as unknown as ExamReviewAnswer[])
    .filter((answer) => getJoinedQuestion(answer))
    .map((answer) => {
      const question = getJoinedQuestion(answer)!;
      const selectedOption = String(answer.selected_option || "").toUpperCase() || null;
      const correctOption = String(question.correct_option || "").toUpperCase() || null;

      return {
        question_id: question.id,
        question: question.question,
        selected_option: selectedOption,
        selected_answer: getOptionText(question, selectedOption),
        correct_option: correctOption,
        correct_answer: getOptionText(question, correctOption),
        is_correct: !!answer.is_correct,
      };
    });

  return { review, error: null };
}

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

  let review = null;

  if (submission?.submitted_at) {
    const reviewResult = await getExamReview(submission.id);

    if (reviewResult.error) {
      return NextResponse.json({ ok: false, message: reviewResult.error.message }, { status: 500 });
    }

    review = reviewResult.review;
  }

  return NextResponse.json({
    ok: true,
    exam: {
      ...exam,
      duration_minutes: durationMinutes,
    },
    questions: rows,
    submission: submission || null,
    review,
    already_submitted: !!submission?.submitted_at,
  });
}
