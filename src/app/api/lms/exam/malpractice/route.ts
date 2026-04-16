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
  const malpracticeFlags = Math.max(0, Number(body?.malpractice_flags) || 0);

  if (!examId) {
    return NextResponse.json({ ok: false, message: "Missing exam ID." }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabaseServer
    .from("sod_exam_submissions")
    .select("id, malpractice_flags, submitted_at")
    .eq("exam_id", examId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (submissionError) {
    return NextResponse.json({ ok: false, message: submissionError.message }, { status: 500 });
  }

  if (!submission || submission.submitted_at) {
    return NextResponse.json({ ok: true });
  }

  const nextFlags = Math.max(
    malpracticeFlags,
    Number(submission.malpractice_flags) || 0
  );

  const { error: updateError } = await supabaseServer
    .from("sod_exam_submissions")
    .update({ malpractice_flags: nextFlags })
    .eq("id", submission.id)
    .is("submitted_at", null);

  if (updateError) {
    return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, malpractice_flags: nextFlags });
}
