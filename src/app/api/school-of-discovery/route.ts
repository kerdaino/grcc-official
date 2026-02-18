import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Required fields (we also need email now for confirmation mail)
    if (!body?.name || !body?.address || !body?.date_of_birth || !body?.email) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields (name, address, date_of_birth, email)." },
        { status: 400 }
      );
    }

    // 1) Save to DB
    const { error } = await supabaseServer.from("school_of_discovery").insert([
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
        disciple_of: body.disciple_of ?? "",
        email: body.email, // <— add email column later if not existing yet
      },
    ]);

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    // 2) Send confirmation email
    const from = process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: body.email,
      subject: "School of Discovery — Submission Received",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Submission Received ✅</h2>
          <p>Dear <b>${body.name}</b>,</p>
          <p>
            Your School of Discovery registration has been received successfully.
            Our team will review your application and you will receive a follow-up email
            regarding your admission status.
          </p>

          <div style="padding: 12px; background: #f5f5f5; border-radius: 8px;">
            <p style="margin:0"><b>Status:</b> Pending Review</p>
          </div>

          <p style="margin-top: 18px">
            Blessings,<br/>
            <b>Gloryrealm Christian Centre (GRCC)</b>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}
