import { supabaseServer } from "@/lib/supabaseServer";

const CERTIFICATE_THRESHOLD = 70;
const QUIZ_WEIGHT = 0.6;
const FINAL_EXAM_WEIGHT = 0.4;

type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  cohort: string | null;
  status?: string | null;
  payment_status?: string | null;
  access_enabled?: boolean | null;
};

type QuizSubmissionRow = {
  id: string;
  quiz_id: string | null;
  student_id: string;
  score: number | null;
  total: number | null;
  submitted_at: string | null;
  created_at: string | null;
  sod_quizzes: { title: string | null } | { title: string | null }[] | null;
};

type ExamSubmissionRow = {
  id: string;
  exam_id: string | null;
  student_id: string;
  score: number | null;
  total: number | null;
  submitted_at: string | null;
  created_at: string | null;
  sod_exams: { title: string | null } | { title: string | null }[] | null;
};

type AssessmentSummary = {
  id: string;
  assessment_id: string | null;
  assessment_type: "quiz" | "final_exam";
  title: string;
  score: number;
  total: number;
  percentage: number;
  submitted_at: string | null;
  created_at: string | null;
};

function roundPercentage(value: number) {
  return Math.round(value * 100) / 100;
}

function joinedTitle(
  joined: { title: string | null } | { title: string | null }[] | null,
  fallback: string
) {
  const row = Array.isArray(joined) ? joined[0] : joined;

  return row?.title || fallback;
}

function getPercentage(score: number, total: number) {
  if (total <= 0) return 0;

  return roundPercentage((score / total) * 100);
}

function buildAssessmentSummary(
  row: QuizSubmissionRow | ExamSubmissionRow,
  assessmentType: "quiz" | "final_exam"
): AssessmentSummary {
  const score = Number(row.score) || 0;
  const total = Number(row.total) || 0;
  const title =
    assessmentType === "quiz"
      ? joinedTitle((row as QuizSubmissionRow).sod_quizzes, "Quiz")
      : joinedTitle((row as ExamSubmissionRow).sod_exams, "Final Exam");

  return {
    id: row.id,
    assessment_id:
      assessmentType === "quiz"
        ? (row as QuizSubmissionRow).quiz_id
        : (row as ExamSubmissionRow).exam_id,
    assessment_type: assessmentType,
    title,
    score,
    total,
    percentage: getPercentage(score, total),
    submitted_at: row.submitted_at,
    created_at: row.created_at,
  };
}

export function calculateLmsResultSummary(
  student: StudentRow,
  quizSubmissions: QuizSubmissionRow[],
  examSubmissions: ExamSubmissionRow[],
  requiredAssessmentStatus = {
    required_quizzes_count: 0,
    required_quizzes_completed_count: quizSubmissions.length,
    current_final_exam_required: true,
    current_final_exam_completed: examSubmissions.length > 0,
    required_assessments_completed: examSubmissions.length > 0,
  }
) {
  const quizzes = quizSubmissions.map((row) => buildAssessmentSummary(row, "quiz"));
  const finalExams = examSubmissions.map((row) =>
    buildAssessmentSummary(row, "final_exam")
  );
  const submissions = [...quizzes, ...finalExams].sort((a, b) => {
    const aDate = new Date(a.submitted_at || a.created_at || 0).getTime();
    const bDate = new Date(b.submitted_at || b.created_at || 0).getTime();

    return bDate - aDate;
  });
  const totalScore = submissions.reduce((sum, row) => sum + row.score, 0);
  const totalPossible = submissions.reduce((sum, row) => sum + row.total, 0);
  const quizAveragePercentage =
    quizzes.length > 0
      ? roundPercentage(
          quizzes.reduce((sum, row) => sum + row.percentage, 0) /
            quizzes.length
        )
      : 0;
  const currentFinalExam =
    finalExams.find((exam) => requiredAssessmentStatus.current_final_exam_completed) ||
    finalExams[0];
  const finalExamPercentage = currentFinalExam?.percentage || 0;
  const overallPercentage = roundPercentage(
    quizAveragePercentage * QUIZ_WEIGHT + finalExamPercentage * FINAL_EXAM_WEIGHT
  );
  const completionDate =
    submissions.find((row) => row.submitted_at)?.submitted_at || null;
  const certificateType =
    overallPercentage >= CERTIFICATE_THRESHOLD
      ? "Certificate of Completion"
      : "Certificate of Participation";

  return {
    student: {
      id: student.id,
      full_name: student.full_name,
      email: student.email,
      cohort: student.cohort,
    },
    threshold_percentage: CERTIFICATE_THRESHOLD,
    quiz_weight_percentage: QUIZ_WEIGHT * 100,
    final_exam_weight_percentage: FINAL_EXAM_WEIGHT * 100,
    quiz_average_percentage: quizAveragePercentage,
    final_exam_percentage: finalExamPercentage,
    total_score: totalScore,
    total_possible: totalPossible,
    overall_percentage: overallPercentage,
    certificate_type: certificateType,
    eligible_for_completion_certificate:
      overallPercentage >= CERTIFICATE_THRESHOLD,
    completion_date: completionDate,
    ...requiredAssessmentStatus,
    submissions_count: submissions.length,
    quiz_submissions_count: quizzes.length,
    final_exam_submissions_count: finalExams.length,
    submissions,
  };
}

export async function getStudentForLmsResult(studentId: string) {
  return supabaseServer
    .from("sod_students")
    .select("id, full_name, email, cohort, status, payment_status, access_enabled")
    .eq("id", studentId)
    .maybeSingle<StudentRow>();
}

export async function getSubmittedQuizResults(studentId: string) {
  return supabaseServer
    .from("sod_quiz_submissions")
    .select(
      `
      id,
      quiz_id,
      student_id,
      score,
      total,
      submitted_at,
      created_at,
      sod_quizzes (
        title
      )
    `
    )
    .eq("student_id", studentId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .returns<QuizSubmissionRow[]>();
}

export async function getSubmittedExamResults(studentId: string) {
  return supabaseServer
    .from("sod_exam_submissions")
    .select(
      `
      id,
      exam_id,
      student_id,
      score,
      total,
      submitted_at,
      created_at,
      sod_exams (
        title
      )
    `
    )
    .eq("student_id", studentId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .returns<ExamSubmissionRow[]>();
}

export async function getRequiredAssessmentStatus(
  studentId: string,
  quizSubmissions: QuizSubmissionRow[],
  examSubmissions: ExamSubmissionRow[]
) {
  const [quizResult, examResult] = await Promise.all([
    supabaseServer
      .from("sod_quizzes")
      .select("id")
      .eq("is_published", true)
      .returns<{ id: string }[]>(),
    supabaseServer
      .from("sod_exams")
      .select("id")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>(),
  ]);

  if (quizResult.error) {
    return { status: null, error: quizResult.error };
  }

  if (examResult.error) {
    return { status: null, error: examResult.error };
  }

  const requiredQuizIds = (quizResult.data || []).map((quiz) => quiz.id);
  const submittedQuizIds = new Set(
    quizSubmissions
      .map((submission) => submission.quiz_id)
      .filter((quizId): quizId is string => !!quizId)
  );
  const requiredQuizzesCompletedCount = requiredQuizIds.filter((quizId) =>
    submittedQuizIds.has(quizId)
  ).length;
  const currentFinalExamId = examResult.data?.id || null;
  const currentFinalExamCompleted = currentFinalExamId
    ? examSubmissions.some(
        (submission) => submission.exam_id === currentFinalExamId
      )
    : false;

  return {
    status: {
      required_quizzes_count: requiredQuizIds.length,
      required_quizzes_completed_count: requiredQuizzesCompletedCount,
      current_final_exam_required: !!currentFinalExamId,
      current_final_exam_completed: currentFinalExamCompleted,
      required_assessments_completed:
        requiredQuizzesCompletedCount === requiredQuizIds.length &&
        !!currentFinalExamId &&
        currentFinalExamCompleted,
    },
    error: null,
  };
}

export async function getLmsResultSummaryForStudent(student: StudentRow) {
  const [quizResult, examResult] = await Promise.all([
    getSubmittedQuizResults(student.id),
    getSubmittedExamResults(student.id),
  ]);

  if (quizResult.error) {
    return { summary: null, error: quizResult.error };
  }

  if (examResult.error) {
    return { summary: null, error: examResult.error };
  }

  const quizSubmissions = quizResult.data || [];
  const examSubmissions = examResult.data || [];
  const { status, error } = await getRequiredAssessmentStatus(
    student.id,
    quizSubmissions,
    examSubmissions
  );

  if (error) {
    return { summary: null, error };
  }

  return {
    summary: calculateLmsResultSummary(
      student,
      quizSubmissions,
      examSubmissions,
      status || undefined
    ),
    error: null,
  };
}
