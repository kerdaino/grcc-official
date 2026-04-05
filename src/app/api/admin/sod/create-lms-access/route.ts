import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";
import { Resend } from "resend";
import { generateTempPassword, hashPassword } from "@/lib/password";

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

  const { data: applicant, error } = await supabaseServer
    .from("school_of_discovery")
    .select("id, name, email, status")
    .eq("id", id)
    .single();

  if (error || !applicant) {
    return NextResponse.json(
      { ok: false, message: "Applicant not found" },
      { status: 404 }
    );
  }

  if (applicant.status !== "onboarded") {
    return NextResponse.json(
      { ok: false, message: "Only onboarded students can receive LMS access." },
      { status: 400 }
    );
  }

  if (!applicant.email) {
    return NextResponse.json(
      { ok: false, message: "Applicant email is missing." },
      { status: 400 }
    );
  }

  const tempPassword = generateTempPassword(10);
  const passwordHash = hashPassword(tempPassword);

  const normalizedEmail = String(applicant.email).trim().toLowerCase();

  const { data: existingStudent } = await supabaseServer
    .from("sod_students")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingStudent) {
    const { error: updateErr } = await supabaseServer
      .from("sod_students")
      .update({
        full_name: applicant.name,
        password_hash: passwordHash,
        status: "active",
        payment_status: "paid",
        access_enabled: true,
        cohort: "Cohort 1",
      })
      .eq("id", existingStudent.id);

    if (updateErr) {
      return NextResponse.json(
        { ok: false, message: updateErr.message },
        { status: 500 }
      );
    }
  } else {
    const { error: insertErr } = await supabaseServer.from("sod_students").insert([
      {
        application_id: applicant.id,
        full_name: applicant.name,
        email: normalizedEmail,
        password_hash: passwordHash,
        status: "active",
        payment_status: "paid",
        access_enabled: true,
        cohort: "Cohort 1",
      },
    ]);

    if (insertErr) {
      return NextResponse.json(
        { ok: false, message: insertErr.message },
        { status: 500 }
      );
    }
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "GRCC <onboarding@resend.dev>";
  const replyTo =
    process.env.ADMIN_NOTIFY_EMAIL || "gloryrealm2025@gmail.com";

  const lmsUrl =
    process.env.LMS_LOGIN_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/lms/login`;

  try {
    await resend.emails.send({
      from,
      to: normalizedEmail,
      replyTo,
      subject: "School of Discovery — LMS Login Details",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Your LMS Access Is Ready ✅</h2>

          <p>Dear <strong>${applicant.name}</strong>,</p>

          <p>
            Your School of Discovery LMS access has been created successfully.
          </p>

          <p><strong>Login Details</strong></p>
          <p>
            <strong>Email:</strong> ${normalizedEmail}<br/>
            <strong>Temporary Password:</strong> ${tempPassword}
          </p>

          <p>
            <strong>Login here:</strong><br/>
            <a href="${lmsUrl}" target="_blank">${lmsUrl}</a>
          </p>

          <p>
            Kindly log in and keep your details safe.
          </p>

          <p>
            Orientation & Matriculation is scheduled for <strong>April 8, 2026</strong>.<br/>
            Classes begin on <strong>April 10, 2026</strong>.
          </p>

          <p style="margin-top: 18px;">
            Blessings,<br/>
            <strong>GRCC Admin</strong>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Failed to send LMS login details" },
      { status: 500 }
    );
  }
}