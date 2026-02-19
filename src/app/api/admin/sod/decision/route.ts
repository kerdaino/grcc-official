import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const cookieStore = await cookies();
const isAdmin = cookieStore.get("grcc_admin")?.value === "1";
  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id, decision } = await req.json();

  if (!id || !["admitted", "rejected"].includes(decision)) {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }

  // Fetch applicant
  const { data: row, error: readErr } = await supabaseServer
    .from("school_of_discovery")
    .select("id,name,email,status")
    .eq("id", id)
    .single();

  if (readErr || !row) {
    return NextResponse.json({ ok: false, message: readErr?.message || "Not found" }, { status: 404 });
  }

  // Update status
  const { error: upErr } = await supabaseServer
    .from("school_of_discovery")
    .update({ status: decision })
    .eq("id", id);

  if (upErr) {
    return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });
  }

  // Send email (and copy to admin notify email)
  const from = process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
  const adminCopy = process.env.ADMIN_NOTIFY_EMAIL;

  const applicantEmail = row.email;
  const applicantName = row.name;

  const subject =
    decision === "admitted"
      ? "School of Discovery — Admission Update"
      : "School of Discovery — Application Update";

  const html =
    decision === "admitted"
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Congratulations ✅</h2>
          <p>Dear <b>${applicantName}</b>,</p>
          <p>
            We are pleased to inform you that you have been <b>ADMITTED</b> into the School of Discovery.
          </p>
          <p>
            Further details will be communicated to you shortly.
          </p>
          <p style="margin-top: 18px">
            Blessings,<br/>
            <b>Gloryrealm Christian Centre (GRCC)</b>
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
            <b>Gloryrealm Christian Centre (GRCC)</b>
          </p>
        </div>
      `;

  // Send to applicant (may not deliver until domain verification)
  if (applicantEmail) {
    try {
      await resend.emails.send({
        from,
        to: applicantEmail,
        subject,
        html,
      });
    } catch {
      // ignore to avoid blocking admin action
    }
  }

  // Always send copy to admin email so you can confirm it worked
  if (adminCopy) {
    await resend.emails.send({
      from,
      to: adminCopy,
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
