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

  const { id } = await req.json();

  const { data: applicant, error } = await supabaseServer
    .from("school_of_discovery")
    .select("name,email,status")
    .eq("id", id)
    .single();

  if (error || !applicant) {
    return NextResponse.json(
      { ok: false, message: "Applicant not found" },
      { status: 404 }
    );
  }

  if (applicant.status !== "admitted") {
    return NextResponse.json(
      { ok: false, message: "Only admitted students can receive follow-up" },
      { status: 400 }
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";

  const replyTo =
    process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

  try {
    await resend.emails.send({
      from,
      to: applicant.email,
      replyTo,
      subject: "Reminder — School of Discovery Enrollment",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
  <h2>Reminder — School of Discovery Enrollment</h2>

  <p>Dear ${applicant.name},</p>

  <p>
    This is a reminder to complete your enrollment for the
    <strong>School of Discovery</strong>.
  </p>

  <p>
    We are excited about your admission, and we look forward to having you
    in this transformational journey.
  </p>

  <hr />

  <h3>Payment Deadline</h3>

  <p>
    Kindly note that your admission slot will only be secured after payment.
  </p>

  <p style="font-size: 16px; font-weight: bold; color: #b91c1c;">
    Payment closes today, April 5, 2026.
  </p>

  <p>
    If payment is not made today, your slot may no longer be guaranteed.
  </p>

  <hr />

  <h3>Payment Details</h3>

  <p style="font-size: 16px; font-weight: bold;">
    ₦5,000 (Nigeria) <br />
    $5 (International Students)
  </p>

  <p>
    <strong>Account Name:</strong> GLORYREALM CHRISTIAN CENTRE<br />
    <strong>Bank:</strong> Access Bank
  </p>

  <p>
    <strong>Naira Account:</strong> 1917160885<br />
    <strong>Dollar Account:</strong> 1917918141
  </p>

  <hr />

  <h3>Next Step</h3>

  <p>
    After payment, kindly send your proof of payment to:
  </p>

  <p style="font-weight: bold;">
    gloryrealm2025@gmail.com
  </p>

  <p>
    If you are having any difficulty making payment or have any concerns,
    please reply to this email or send a message to the email above.
  </p>

  <hr />

  <p>
    <strong>Important:</strong> Only students who complete payment will receive
    access to the class sessions, LMS login details, and other onboarding materials.
  </p>

  <p>
    We look forward to having you.
  </p>

  <p>
    Blessings,<br />
    <strong>GRCC Admin</strong>
  </p>
</div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e.message },
      { status: 500 }
    );
  }
}