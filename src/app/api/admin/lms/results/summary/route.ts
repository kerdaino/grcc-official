import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getLmsResultSummaryForStudent,
  getStudentForLmsResult,
} from "@/lib/lmsResults";
import { getCertificateByStudentId } from "@/lib/lmsCertificates";
import { supabaseServer } from "@/lib/supabaseServer";

type StudentRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  cohort: string | null;
};

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("student_id");

  if (studentId) {
    const { data: student, error: studentError } =
      await getStudentForLmsResult(studentId);

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

    const { summary, error } = await getLmsResultSummaryForStudent(student);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const { data: certificate, error: certificateError } =
      await getCertificateByStudentId(student.id);

    if (certificateError) {
      return NextResponse.json(
        { ok: false, message: certificateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      summary: {
        ...summary,
        certificate,
      },
    });
  }

  const { data: students, error: studentsError } = await supabaseServer
    .from("sod_students")
    .select("id, full_name, email, cohort")
    .order("created_at", { ascending: false })
    .returns<StudentRow[]>();

  if (studentsError) {
    return NextResponse.json(
      { ok: false, message: studentsError.message },
      { status: 500 }
    );
  }

  const summaries = [];

  for (const student of students || []) {
    const { summary, error } = await getLmsResultSummaryForStudent(student);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const { data: certificate, error: certificateError } =
      await getCertificateByStudentId(student.id);

    if (certificateError) {
      return NextResponse.json(
        { ok: false, message: certificateError.message },
        { status: 500 }
      );
    }

    summaries.push({
      ...summary,
      certificate,
    });
  }

  return NextResponse.json({ ok: true, rows: summaries });
}
