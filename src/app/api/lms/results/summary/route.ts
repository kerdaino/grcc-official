import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getLmsResultSummaryForStudent,
  getStudentForLmsResult,
} from "@/lib/lmsResults";

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { data: student, error: studentError } =
    await getStudentForLmsResult(studentId);

  if (studentError) {
    return NextResponse.json(
      { ok: false, message: studentError.message },
      { status: 500 }
    );
  }

  if (!student || !student.access_enabled || student.payment_status !== "paid") {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { summary, error } = await getLmsResultSummaryForStudent(student);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, summary });
}

