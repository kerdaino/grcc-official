import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id, decision } = await req.json();

  if (!id || !["admitted", "rejected"].includes(decision)) {
    return NextResponse.json(
      { ok: false, message: "Invalid request" },
      { status: 400 }
    );
  }

  const { data: row, error: readErr } = await supabaseServer
    .from("school_of_discovery")
    .select("id,name,email,status")
    .eq("id", id)
    .single();

  if (readErr || !row) {
    return NextResponse.json(
      { ok: false, message: readErr?.message || "Not found" },
      { status: 404 }
    );
  }

  const { error: upErr } = await supabaseServer
    .from("school_of_discovery")
    .update({ status: decision })
    .eq("id", id);

  if (upErr) {
    return NextResponse.json(
      { ok: false, message: upErr.message },
      { status: 500 }
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
  const adminCopy = process.env.ADMIN_NOTIFY_EMAIL;
  const replyTo =
    process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

  const applicantEmail = row.email;
  const applicantName = row.name;

  const subject =
    decision === "admitted"
      ? "School of Discovery — Admission Update"
      : "School of Discovery — Application Update";

  const html =
    decision === "admitted"
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Congratulations 🎉</h2>

          <p>Dear ${applicantName},</p>

          <p>
            We are pleased to inform you that you have been <strong>admitted</strong> into the 
            <strong>School of Discovery</strong>.
          </p>

          <p>
            This program is designed to build you spiritually, strengthen your foundation, 
            and equip you to live and represent Christ effectively in every area of life.
          </p>

          <hr />

          <h3>Enrollment Instruction</h3>

          <p>
            To confirm your participation, kindly complete your enrollment by making a payment of:
          </p>

          <p style="font-size: 18px; font-weight: bold;">
            ₦5,000 (Nigeria) <br/>
            $5 (International Students)
          </p>

          <p>
            This fee covers program logistics, coordination, certificate, and student support systems.
          </p>

          <h4>Payment Details</h4>

          <p>
            <strong>Account Name:</strong> GLORYREALM CHRISTIAN CENTRE <br/>
            <strong>Bank:</strong> Access Bank
          </p>

          <p>
            <strong>Naira Account:</strong> 1917160885 <br/>
            <strong>Dollar Account:</strong> 1917918141
          </p>

          <p>
            After making payment, kindly send your proof of payment by replying to this email.
          </p>

          <p>
            <strong>If you are having any difficulty making payment, please reply to this email and let us know your concerns.</strong>
          </p>

          <hr />

          <p>
            <strong>Important:</strong> Admission is only confirmed after payment.
          </p>

          <p>
            Once your payment is verified, you will receive:
            <br/>• Access to the student dashboard  
            <br/>• Class schedule and live session link  
            <br/>• Further onboarding instructions
          </p>

          <p>
            We look forward to having you in this journey.
          </p>

          <p>
            Blessings,<br/>
            <strong>GRCC Admin</strong>
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Application Update</h2>
          <p>Dear <b>${applicantName}</b>,</p>
          <p>
            Thank you for your interest in the School of Discovery.
            After review, you are currently marked as <b>NOT ADMITTED</b>.
          </p>
          <p>
            Please be encouraged and keep growing in the Word and prayer.
          </p>
          <p style="margin-top: 18px">
            Blessings,<br/>
            <b>GRCC Admin</b>
          </p>
        </div>
      `;

  if (applicantEmail) {
    try {
      await resend.emails.send({
        from,
        to: applicantEmail,
        replyTo,
        subject,
        html,
      });
    } catch {
      // ignore
    }
  }

  if (adminCopy) {
    await resend.emails.send({
      from,
      to: adminCopy,
      replyTo,
      subject: `[COPY] ${subject} — ${applicantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <p><b>Applicant:</b> ${applicantName}</p>
          <p><b>Email:</b> ${applicantEmail || "N/A"}</p>
          <p><b>Decision:</b> ${decision}</p>
          <hr/>
          ${html}
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}