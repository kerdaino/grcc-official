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

  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Missing ID" },
      { status: 400 }
    );
  }

  const { data: row, error } = await supabaseServer
    .from("school_of_discovery")
    .select("id, name, email, status")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json(
      { ok: false, message: "Applicant not found" },
      { status: 404 }
    );
  }

  if (row.status !== "admitted") {
    return NextResponse.json(
      { ok: false, message: "Only admitted students can be onboarded" },
      { status: 400 }
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
  const replyTo =
    process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

  const GROUP_LINK = process.env.WHATSAPP_GROUP_LINK?.trim();
  const CHANNEL_LINK = process.env.WHATSAPP_CHANNEL_LINK?.trim();
  const SUPPORT_EMAIL =
    process.env.ADMIN_NOTIFY_EMAIL?.trim() || "gloryrealm2025@gmail.com";

  if (!GROUP_LINK || !CHANNEL_LINK) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "WhatsApp group or channel link is missing. Please set WHATSAPP_GROUP_LINK and WHATSAPP_CHANNEL_LINK in your environment variables.",
        debug: {
          hasGroupLink: !!GROUP_LINK,
          hasChannelLink: !!CHANNEL_LINK,
        },
      },
      { status: 500 }
    );
  }

  try {
    await resend.emails.send({
      from,
      to: row.email,
      replyTo,
      subject: "School of Discovery — Onboarding Instructions",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to School of Discovery 🎉</h2>

          <p>Dear <strong>${row.name}</strong>,</p>

          <p>
            Your payment has been confirmed and your enrollment is now complete.
          </p>

          <p>
            We are excited to have you join this journey of spiritual growth and transformation.
          </p>

          <hr />

          <h3>Next Steps</h3>

          <p><strong>📅 Class Start Date:</strong></p>
          <p style="font-size:16px; font-weight:bold; color:#7c3aed;">
            April 10, 2026
          </p>

          <p>
            Please ensure you are available and prepared to begin fully.
          </p>

          <p>
            More details, including time and session structure, will be communicated in the WhatsApp group.
          </p>

          <hr />

          <p><strong>1. Join the Students WhatsApp Group:</strong></p>
          <p>
            <a href="${GROUP_LINK}" target="_blank">👉 Join Group</a>
          </p>

          <p><strong>2. Follow the Announcement Channel:</strong></p>
          <p>
            <a href="${CHANNEL_LINK}" target="_blank">👉 Join Channel</a>
          </p>

          <hr />

          <p>
            If you have any questions or difficulty accessing anything,
            kindly reach out via this email:
          </p>

          <p><strong>${SUPPORT_EMAIL}</strong></p>

          <hr />

          <p>
            Welcome once again. We look forward to all God will do through this program.
          </p>

          <p>
            Blessings,<br/>
            <strong>GRCC Admin</strong>
          </p>
        </div>
      `,
    });

    await supabaseServer
      .from("school_of_discovery")
      .update({ status: "onboarded" })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to send onboarding" },
      { status: 500 }
    );
  }
}