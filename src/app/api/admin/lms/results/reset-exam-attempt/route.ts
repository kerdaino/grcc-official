import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDefaultExamOverrideExpiresAt } from "@/lib/lmsExamOverrides";
import { supabaseServer } from "@/lib/supabaseServer";

type ExamSubmissionForReset = {
  id: string;
  exam_id: string | null;
  student_id: string;
  submitted_at: string | null;
};

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const studentId = body?.student_id;
  const submissionId = body?.submission_id;
  const grantOverride = body?.grant_override === true;

  if (!studentId || !submissionId) {
    return NextResponse.json(
      { ok: false, message: "Missing student or submission ID." },
      { status: 400 }
    );
  }

  const { data: student, error: studentError } = await supabaseServer
    .from("sod_students")
    .select("id")
    .eq("id", studentId)
    .maybeSingle<{ id: string }>();

  if (studentError) {
    return NextResponse.json(
      { ok: false, message: studentError.message },
      { status: 500 }
    );
  }

  if (!student) {
    return NextResponse.json(
      { ok: false, message: "Student not found." },
      { status: 404 }
    );
  }

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .select("id, exam_id, student_id, submitted_at")
    .eq("id", submissionId)
    .eq("student_id", studentId)
    .maybeSingle<ExamSubmissionForReset>();

  if (submissionError) {
    return NextResponse.json(
      { ok: false, message: submissionError.message },
      { status: 500 }
    );
  }

  if (!submission || !submission.exam_id) {
    return NextResponse.json(
      { ok: false, message: "Final exam submission not found for this student." },
      { status: 404 }
    );
  }

  const { error: answersError } = await supabaseServer
    .from("sod_exam_answers")
    .delete()
    .eq("submission_id", submission.id);

  if (answersError) {
    return NextResponse.json(
      { ok: false, message: answersError.message },
      { status: 500 }
    );
  }

  const { error: deleteSubmissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .delete()
    .eq("id", submission.id)
    .eq("student_id", studentId);

  if (deleteSubmissionError) {
    return NextResponse.json(
      { ok: false, message: deleteSubmissionError.message },
      { status: 500 }
    );
  }

  const { error: deleteCertificateError } = await supabaseServer
    .from("sod_certificates")
    .delete()
    .eq("student_id", studentId);

  if (deleteCertificateError) {
    return NextResponse.json(
      { ok: false, message: deleteCertificateError.message },
      { status: 500 }
    );
  }

  let overrideAvailableUntil: string | null = null;

  if (grantOverride) {
    overrideAvailableUntil = getDefaultExamOverrideExpiresAt();

    const { error: overrideError } = await supabaseServer
      .from("sod_exam_overrides")
      .upsert(
        {
          student_id: studentId,
          exam_id: submission.exam_id,
          available_until: overrideAvailableUntil,
        },
        { onConflict: "student_id,exam_id" }
      );

    if (overrideError) {
      return NextResponse.json(
        { ok: false, message: overrideError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: grantOverride
      ? "Final exam attempt reset for this student only. A per-student retake override was added."
      : "Final exam attempt reset for this student only.",
    student_id: studentId,
    exam_id: submission.exam_id,
    deleted_submission_id: submission.id,
    override_available_until: overrideAvailableUntil,
  });
}
