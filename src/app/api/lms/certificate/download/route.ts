import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import path from "path";
import QRCode from "qrcode";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { ensureCertificateForStudent } from "@/lib/lmsCertificates";

const CERTIFICATE_LOGO_PATH = "public/images/logo4.png";
const CERTIFICATE_PARENT_MINISTRY = "Gloryrealm Christian Centre";

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function filenameFromName(name: string) {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return cleaned || "student";
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;

    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);

  return lines;
}

async function embedCertificateLogo(pdfDoc: PDFDocument) {
  try {
    const logoBytes = await readFile(path.join(process.cwd(), CERTIFICATE_LOGO_PATH));

    return pdfDoc.embedPng(logoBytes);
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const studentId = cookieStore.get("grcc_lms_student")?.value;

  if (!studentId) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { certificate, error, status } =
    await ensureCertificateForStudent(studentId);

  if (error || !certificate) {
    return NextResponse.json(
      { ok: false, message: error?.message || "Certificate is not available." },
      { status }
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
  const qrImageBytes = Buffer.from(qrCodeDataUrl.split(",")[1] || "", "base64");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();
  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  const logoImage = await embedCertificateLogo(pdfDoc);
  const purple = rgb(0.28, 0.12, 0.58);
  const gold = rgb(0.83, 0.62, 0.13);
  const slate = rgb(0.2, 0.25, 0.33);
  const isCompletion =
    certificate.certificate_type === "Certificate of Completion";
  const statement = isCompletion
    ? `This certifies that ${certificate.student_name} has successfully met all requirements for the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`
    : `This certifies that ${certificate.student_name} participated in the Realms School of Discovery program under ${CERTIFICATE_PARENT_MINISTRY}.`;

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: purple,
    borderWidth: 6,
    color: rgb(1, 1, 1),
  });
  page.drawRectangle({
    x: 42,
    y: 42,
    width: width - 84,
    height: height - 84,
    borderColor: gold,
    borderWidth: 2,
  });

  if (logoImage) {
    page.drawImage(logoImage, {
      x: (width - 58) / 2,
      y: 516,
      width: 58,
      height: 58,
    });
  }

  page.drawText("Realms Institute", {
    x: (width - serifBold.widthOfTextAtSize("Realms Institute", 30)) / 2,
    y: 485,
    size: 30,
    font: serifBold,
    color: purple,
  });
  page.drawText("REALMS SCHOOL OF DISCOVERY", {
    x: (width - sansBold.widthOfTextAtSize("REALMS SCHOOL OF DISCOVERY", 14)) / 2,
    y: 455,
    size: 14,
    font: sansBold,
    color: slate,
  });
  page.drawText("UNDER GLORYREALM CHRISTIAN CENTRE", {
    x:
      (width -
        sansBold.widthOfTextAtSize("UNDER GLORYREALM CHRISTIAN CENTRE", 10)) /
      2,
    y: 436,
    size: 10,
    font: sansBold,
    color: rgb(0.39, 0.45, 0.55),
  });

  page.drawText(certificate.certificate_type, {
    x:
      (width -
        serifBold.widthOfTextAtSize(certificate.certificate_type, 42)) /
      2,
    y: 385,
    size: 42,
    font: serifBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText("This certificate is proudly presented to", {
    x:
      (width -
        sans.widthOfTextAtSize("This certificate is proudly presented to", 16)) /
      2,
    y: 345,
    size: 16,
    font: sans,
    color: slate,
  });
  page.drawText(certificate.student_name, {
    x:
      (width - serifBold.widthOfTextAtSize(certificate.student_name, 34)) / 2,
    y: 298,
    size: 34,
    font: serifBold,
    color: purple,
  });
  page.drawLine({
    start: { x: 235, y: 286 },
    end: { x: 607, y: 286 },
    thickness: 1.5,
    color: gold,
  });

  const statementLines = wrapText(statement, 86);
  statementLines.forEach((line, index) => {
    page.drawText(line, {
      x: (width - sans.widthOfTextAtSize(line, 15)) / 2,
      y: 240 - index * 22,
      size: 15,
      font: sans,
      color: slate,
    });
  });

  page.drawText("Issued Date", {
    x: 88,
    y: 135,
    size: 9,
    font: sansBold,
    color: rgb(0.39, 0.45, 0.55),
  });
  page.drawText(formatDate(certificate.issued_at), {
    x: 88,
    y: 116,
    size: 13,
    font: sansBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText("Certificate ID", {
    x: 88,
    y: 88,
    size: 9,
    font: sansBold,
    color: rgb(0.39, 0.45, 0.55),
  });
  page.drawText(certificate.certificate_code, {
    x: 88,
    y: 69,
    size: 13,
    font: sansBold,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawImage(qrImage, {
    x: 372,
    y: 72,
    width: 98,
    height: 98,
  });
  page.drawText("Scan to verify", {
    x: 384,
    y: 55,
    size: 9,
    font: sans,
    color: rgb(0.39, 0.45, 0.55),
  });

  page.drawLine({
    start: { x: 560, y: 128 },
    end: { x: 754, y: 128 },
    thickness: 1,
    color: slate,
  });
  page.drawText(certificate.admin_acknowledgement, {
    x: 560,
    y: 105,
    size: 13,
    font: sansBold,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText("Admin Acknowledgement", {
    x: 560,
    y: 87,
    size: 10,
    font: sans,
    color: rgb(0.39, 0.45, 0.55),
  });

  const pdfBytes = await pdfDoc.save();
  const filename = `realms-school-of-discovery-${filenameFromName(certificate.student_name)}-certificate.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
