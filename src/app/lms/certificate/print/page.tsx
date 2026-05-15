import { cookies } from "next/headers";
import QRCode from "qrcode";
import LMSLayout from "@/components/lms/LMSLayout";
import LMSHeader from "@/components/lms/LMSHeader";
import { ensureCertificateForStudent } from "@/lib/lmsCertificates";
import PrintCertificateButton from "./PrintCertificateButton";

const CERTIFICATE_LOGO_PATH = "/images/logo4.png";
const CERTIFICATE_PARENT_MINISTRY = "Gloryrealm Christian Centre";

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default async function LMSPrintableCertificatePage() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return (
      <LMSLayout>
        <div className="rounded-2xl border bg-white p-6 text-slate-700 shadow-sm">
          Unauthorized
        </div>
      </LMSLayout>
    );
  }

  const { certificate, error } = await ensureCertificateForStudent(studentId);

  if (error || !certificate) {
    return (
      <LMSLayout>
        <LMSHeader
          title="Certificate"
          subtitle="Certificate pending"
        />
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
          {error?.message || "Certificate pending"}
        </div>
      </LMSLayout>
    );
  }

  const verificationUrl =
    certificate.verification_url ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify-certificate/${certificate.certificate_code}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });
  const isCompletion =
    certificate.certificate_type === "Certificate of Completion";
  const statement = isCompletion
    ? `This certifies that ${certificate.student_name} has successfully met all requirements for the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`
    : `This certifies that ${certificate.student_name} participated in the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`;

  return (
    <LMSLayout>
      <div className="mb-5 flex justify-end print:hidden">
        <PrintCertificateButton />
      </div>

      <section className="mx-auto aspect-[1.414/1] w-full max-w-6xl border-[10px] border-purple-900 bg-white p-6 shadow-sm print:max-w-none print:border-[8px] print:shadow-none">
        <div className="flex h-full flex-col border-4 border-[#d4af37] px-10 py-8 text-center">
          <div>
            <img
              src={CERTIFICATE_LOGO_PATH}
              alt="Realms Institute logo"
              className="mx-auto mb-3 h-16 w-16 object-contain"
            />
            <p className="font-serif text-4xl font-bold text-purple-900">
              Realms Institute
            </p>
            <p className="mt-3 text-xl font-bold uppercase tracking-[0.18em] text-slate-700">
              Realms School of Discovery
            </p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Under {CERTIFICATE_PARENT_MINISTRY}
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center">
            <h1 className="font-serif text-6xl font-bold text-slate-950">
              {certificate.certificate_type}
            </h1>
            <p className="mt-8 text-lg text-slate-600">
              This certificate is proudly presented to
            </p>
            <p className="mt-5 border-b-2 border-[#d4af37] px-16 pb-3 font-serif text-5xl font-bold text-purple-900">
              {certificate.student_name}
            </p>
            <p className="mt-8 max-w-3xl text-xl leading-9 text-slate-700">
              {statement}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-8">
            <div className="text-left">
              <p className="text-sm font-semibold uppercase text-slate-500">
                Issued Date
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {formatDate(certificate.issued_at)}
              </p>
              <p className="mt-4 text-sm font-semibold uppercase text-slate-500">
                Certificate ID
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {certificate.certificate_code}
              </p>
            </div>

            <div className="text-center">
              <img
                src={qrCodeDataUrl}
                alt="Certificate verification QR code"
                className="mx-auto h-28 w-28"
              />
              <p className="mt-2 text-xs text-slate-500">Scan to verify</p>
            </div>

            <div className="text-right">
              <div className="ml-auto h-px w-72 bg-slate-700" />
              <p className="mt-3 font-bold text-slate-900">
                Admin Acknowledgement
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {certificate.admin_acknowledgement}
              </p>
            </div>
          </div>
        </div>
      </section>
    </LMSLayout>
  );
}
