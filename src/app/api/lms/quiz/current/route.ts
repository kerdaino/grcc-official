import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

type QuizReviewAnswer = {
  selected_option: string | null;
  is_correct: boolean | null;
  sod_quiz_questions: {
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
  question: Exclude<NonNullable<QuizReviewAnswer["sod_quiz_questions"]>, unknown[]>,
  option: string | null
) {
  const normalized = String(option || "").toUpperCase();

  if (normalized === "A") return question.option_a;
  if (normalized === "B") return question.option_b;
  if (normalized === "C") return question.option_c;
  if (normalized === "D") return question.option_d;

  return null;
}

function getJoinedQuestion(answer: QuizReviewAnswer) {
  const question = answer.sod_quiz_questions;

  return Array.isArray(question) ? question[0] : question;
}

async function getQuizReview(submissionId: string) {
  const { data: answers, error } = await supabaseServer
    .from("sod_quiz_answers")
    .select(`
      selected_option,
      is_correct,
      sod_quiz_questions (
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

  const review = ((answers || []) as unknown as QuizReviewAnswer[])
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
  let fallbackSubmittedSubmission = null;

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
    const { data: submittedSubmission, error: submittedSubmissionError } = await supabaseServer
      .from("sod_quiz_submissions")
      .select("id, quiz_id, score, total, started_at, submitted_at, malpractice_flags")
      .eq("student_id", studentId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (submittedSubmissionError) {
      return NextResponse.json({ ok: false, message: submittedSubmissionError.message }, { status: 500 });
    }

    if (submittedSubmission?.quiz_id) {
      const { data: submittedQuiz, error: submittedQuizError } = await supabaseServer
        .from("sod_quizzes")
        .select("*")
        .eq("id", submittedSubmission.quiz_id)
        .eq("is_published", true)
        .maybeSingle();

      if (submittedQuizError) {
        return NextResponse.json({ ok: false, message: submittedQuizError.message }, { status: 500 });
      }

      quiz = submittedQuiz;
      fallbackSubmittedSubmission = submittedQuiz ? submittedSubmission : null;
    }
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

  let submission = activeSubmission || fallbackSubmittedSubmission;

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

  let review = null;

  if (submission?.submitted_at) {
    const reviewResult = await getQuizReview(submission.id);

    if (reviewResult.error) {
      return NextResponse.json({ ok: false, message: reviewResult.error.message }, { status: 500 });
    }

    review = reviewResult.review;
  }

  return NextResponse.json({
    ok: true,
    quiz: {
      ...quiz,
      duration_minutes: durationMinutes,
    },
    questions: rows,
    submission: submission || null,
    review,
    already_submitted: !!submission?.submitted_at,
  });
}
