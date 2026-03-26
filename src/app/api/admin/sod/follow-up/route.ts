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

          <p style="color:#b91c1c; font-weight:bold;">
            Deadline: [INSERT DATE HERE]
          </p>

          <p>
            After payment, send proof to:
            <br/><strong>gloryrealm2025@gmail.com</strong>
          </p>

          <p>
            If you are having issues making payment, kindly reply this email.
          </p>

          <p>
            Only students who complete payment will receive access.
          </p>

          <p>
            Blessings,<br/>
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