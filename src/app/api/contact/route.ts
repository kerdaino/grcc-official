import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.name || !body?.email || !body?.message) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer.from("contact_messages").insert([
      {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || "",
        message: body.message.trim(),
      },
    ]);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
    const replyTo =
      process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

    try {
      await resend.emails.send({
        from,
        to: process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com",
        replyTo,
        subject: "New Contact Message — GRCC Website",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone || "—"}</p>
            <p><strong>Message:</strong></p>
            <div style="padding: 12px; background: #f5f5f5; border-radius: 8px;">
              ${String(body.message).replace(/\n/g, "<br/>")}
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.log("Admin email failed:", err);
    }

    try {
      await resend.emails.send({
        from,
        to: body.email,
        replyTo,
        subject: "We received your message — GRCC",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank you for reaching out</h2>
            <p>Dear <strong>${body.name}</strong>,</p>
            <p>
              We have received your message successfully. Our team will review it
              and get back to you as soon as possible.
            </p>

            <div style="padding: 12px; background: #f5f5f5; border-radius: 8px;">
              <p style="margin: 0;"><strong>Your message:</strong></p>
              <p style="margin-top: 8px;">
                ${String(body.message).replace(/\n/g, "<br/>")}
              </p>
            </div>

            <p style="margin-top: 18px;">
              Blessings,<br/>
              <strong>Gloryrealm Christian Centre (GRCC)</strong>
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.log("Auto-reply email failed:", err);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}