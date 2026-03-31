import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FORM_OPEN = true;

export async function POST(req: Request) {
  if (!FORM_OPEN) {
    return NextResponse.json(
      { ok: false, message: "Registration is closed for this cohort." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    if (!body?.name || !body?.address || !body?.date_of_birth || !body?.email) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields (name, address, date_of_birth, email).",
        },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertErr } = await supabaseServer
      .from("school_of_discovery")
      .insert([
        {
          name: body.name,
          address: body.address,
          date_of_birth: body.date_of_birth,
          salvation_experience: body.salvation_experience ?? "",
          church_attending: body.church_attending ?? "",
          spiritual_covering: body.spiritual_covering ?? "",
          is_worker: body.is_worker ?? "",
          expectation: body.expectation ?? "",
          attended_bible_school: body.attended_bible_school ?? "",
          bible_school_name: body.bible_school_name ?? "",
          disciple_of: body.disciple_of ?? "",
          email: body.email,
          status: "pending",
        },
      ])
      .select("id, created_at, name, email, status")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { ok: false, message: insertErr.message },
        { status: 500 }
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
    const replyTo =
      process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

    let resendResult: any = null;
    let resendError: string | null = null;

    try {
      resendResult = await resend.emails.send({
        from,
        to: body.email,
        replyTo,
        subject: "School of Discovery — Submission Received",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6">
            <h2>Submission Received ✅</h2>
            <p>Dear <b>${body.name}</b>,</p>
            <p>
              Your School of Discovery registration has been received successfully.
              Our team will review your application and you will receive a follow-up email
              regarding your admission status. Thank you.
            </p>
            <p style="margin-top: 18px">
              Blessings,<br/>
              <b>GRCC Admin</b>
            </p>
            <div style="padding: 12px; background: #f5f5f5; border-radius: 8px;">
              <p style="margin:0"><b>Status:</b> Pending Review</p>
            </div>
          </div>
        `,
      });
    } catch (e: any) {
      resendError = e?.message || "Resend failed";
    }

    return NextResponse.json({
      ok: true,
      inserted,
      resend: resendResult,
      resendError,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Server error" },
      { status: 500 }
    );
  }
}