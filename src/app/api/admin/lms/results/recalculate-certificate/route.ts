import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateOrUpdateStudentCertificate } from "@/lib/lmsCertificates";

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

  if (!studentId) {
    return NextResponse.json(
      { ok: false, message: "Missing student ID." },
      { status: 400 }
    );
  }

  const { certificate, summary, error, status } =
    await generateOrUpdateStudentCertificate(studentId);

  if (error || !certificate || !summary) {
    return NextResponse.json(
      { ok: false, message: error?.message || "Failed to generate certificate." },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    certificate,
    summary,
  });
}
