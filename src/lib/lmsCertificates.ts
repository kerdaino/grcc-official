import { randomBytes } from "crypto";
import {
  getLmsResultSummaryForStudent,
  getStudentForLmsResult,
} from "@/lib/lmsResults";
import { supabaseServer } from "@/lib/supabaseServer";

export const CERTIFICATE_PROGRAM_NAME = "Realms School of Discovery";
export const CERTIFICATE_ORGANIZATION_NAME = "Realms Institute";
export const CERTIFICATE_ADMIN_ACKNOWLEDGEMENT =
  "Realms School of Discovery Admin";

export type SodCertificate = {
  id: string;
  student_id: string;
  certificate_type: "Certificate of Completion" | "Certificate of Participation";
  overall_score: number;
  quiz_average: number;
  exam_score: number;
  certificate_code: string;
  verification_url: string | null;
  issued_at: string;
  created_at: string;
  student_name: string;
  program_name: string;
  organization_name: string;
  admin_acknowledgement: string;
};

type SodCertificateRow = {
  id: string;
  student_id: string;
  certificate_type: "Certificate of Completion" | "Certificate of Participation";
  overall_score: number;
  quiz_average: number;
  exam_score: number;
  certificate_code: string;
  verification_url: string | null;
  issued_at: string;
  created_at: string;
};

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function createCertificateCode() {
  return `SOD-${new Date().getFullYear()}-${randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

export function getVerificationUrl(code: string) {
  return `${getSiteUrl()}/verify-certificate/${encodeURIComponent(code)}`;
}

async function getStudentName(studentId: string) {
  const { data } = await supabaseServer
    .from("sod_students")
    .select("full_name")
    .eq("id", studentId)
    .maybeSingle<{ full_name: string | null }>();

  return data?.full_name || "Realms School of Discovery Student";
}

async function hydrateCertificate(row: SodCertificateRow | null) {
  if (!row) return null;

  return {
    ...row,
    student_name: await getStudentName(row.student_id),
    program_name: CERTIFICATE_PROGRAM_NAME,
    organization_name: CERTIFICATE_ORGANIZATION_NAME,
    admin_acknowledgement: CERTIFICATE_ADMIN_ACKNOWLEDGEMENT,
  } satisfies SodCertificate;
}

export async function getCertificateByStudentId(studentId: string) {
  const { data, error } = await supabaseServer
    .from("sod_certificates")
    .select(
      "id, student_id, certificate_type, overall_score, quiz_average, exam_score, certificate_code, verification_url, issued_at, created_at"
    )
    .eq("student_id", studentId)
    .maybeSingle<SodCertificateRow>();

  return {
    data: await hydrateCertificate(data),
    error,
  };
}

export async function getCertificateByCode(code: string) {
  const { data, error } = await supabaseServer
    .from("sod_certificates")
    .select(
      "id, student_id, certificate_type, overall_score, quiz_average, exam_score, certificate_code, verification_url, issued_at, created_at"
    )
    .eq("certificate_code", code)
    .maybeSingle<SodCertificateRow>();

  return {
    data: await hydrateCertificate(data),
    error,
  };
}

export async function ensureCertificateForStudent(studentId: string) {
  const { data: student, error: studentError } =
    await getStudentForLmsResult(studentId);

  if (studentError) {
    return { certificate: null, error: studentError, status: 500 };
  }

  if (!student || !student.access_enabled || student.payment_status !== "paid") {
    return {
      certificate: null,
      error: new Error("Unauthorized"),
      status: 401,
    };
  }

  const existing = await getCertificateByStudentId(studentId);

  if (existing.error) {
    return { certificate: null, error: existing.error, status: 500 };
  }

  if (existing.data) {
    return { certificate: existing.data, error: null, status: 200 };
  }

  const { summary, error: summaryError } =
    await getLmsResultSummaryForStudent(student);

  if (summaryError) {
    return { certificate: null, error: summaryError, status: 500 };
  }

  if (!summary?.required_assessments_completed) {
    return {
      certificate: null,
      error: new Error("Certificate pending"),
      status: 409,
    };
  }

  const code = createCertificateCode();
  const certificateType = summary.eligible_for_completion_certificate
    ? "Certificate of Completion"
    : "Certificate of Participation";
  const verificationUrl = getVerificationUrl(code);

  const { data: certificate, error: insertError } = await supabaseServer
    .from("sod_certificates")
    .insert([
      {
        student_id: student.id,
        certificate_type: certificateType,
        overall_score: summary.overall_percentage,
        quiz_average: summary.quiz_average_percentage,
        exam_score: summary.final_exam_percentage,
        certificate_code: code,
        verification_url: verificationUrl,
      },
    ])
    .select(
      "id, student_id, certificate_type, overall_score, quiz_average, exam_score, certificate_code, verification_url, issued_at, created_at"
    )
    .single<SodCertificateRow>();

  if (insertError) {
    return { certificate: null, error: insertError, status: 500 };
  }

  return {
    certificate: await hydrateCertificate(certificate),
    error: null,
    status: 201,
  };
}
