import PageHero from "@/components/PageHero";
import { getCertificateByCode } from "@/lib/lmsCertificates";

const REALMS_INSTITUTE_LOGO_PATH = "/images/logo4.png";
const CERTIFICATE_PARENT_MINISTRY = "Gloryrealm Christian Centre";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { data: certificate } = await getCertificateByCode(
    decodeURIComponent(code)
  );

  const isCompletion =
    certificate?.certificate_type === "Certificate of Completion";

  return (
    <main>
      <PageHero
        title="Certificate Verification"
        subtitle="Verify a Realms Institute certificate for Realms School of Discovery under Gloryrealm Christian Centre."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {!certificate ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <h1 className="text-2xl font-extrabold">Invalid Certificate</h1>
              <p className="mt-2">
                We could not verify a Realms Institute certificate with this code.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <img
                  src={REALMS_INSTITUTE_LOGO_PATH}
                  alt="Realms Institute logo"
                  className="h-14 w-14 shrink-0 rounded-full object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-purple-700">
                    Realms Institute
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                    {certificate.certificate_type}
                  </h1>
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    Verified Certificate
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Realms School of Discovery under Gloryrealm Christian Centre
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-700">
                {isCompletion
                  ? `This certifies that ${certificate.student_name} has successfully met all requirements for the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`
                  : `This certifies that ${certificate.student_name} participated in the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Student Name
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {certificate.student_name}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Status
                  </p>
                  <p className="mt-2 font-bold text-emerald-700">
                    Verified
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Certificate Type
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {certificate.certificate_type}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Certificate ID
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {certificate.certificate_code}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Date Issued
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {formatDate(certificate.issued_at)}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Institution
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {certificate.organization_name}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Program
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {certificate.program_name}
                  </p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">
                    Parent Ministry
                  </p>
                  <p className="mt-2 font-bold text-slate-900">
                    {CERTIFICATE_PARENT_MINISTRY}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
