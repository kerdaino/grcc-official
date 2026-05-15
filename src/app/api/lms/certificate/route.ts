import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureCertificateForStudent } from "@/lib/lmsCertificates";

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { certificate, error, status } =
    await ensureCertificateForStudent(studentId);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status }
    );
  }

  return NextResponse.json({ ok: true, certificate });
}

