import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const { data: student, error } = await supabaseServer
      .from("sod_students")
      .select("*")
      .eq("email", String(body.email).trim().toLowerCase())
      .single();

    if (error || !student) {
      return NextResponse.json(
        { ok: false, message: "Invalid login details." },
        { status: 401 }
      );
    }

    if (!student.password_hash) {
      return NextResponse.json(
        { ok: false, message: "Your LMS account is not ready yet." },
        { status: 403 }
      );
    }

    if (!student.access_enabled || student.payment_status !== "paid") {
      return NextResponse.json(
        { ok: false, message: "Your LMS access is not active yet." },
        { status: 403 }
      );
    }

    const valid = verifyPassword(body.password, student.password_hash);

    if (!valid) {
      return NextResponse.json(
        { ok: false, message: "Invalid login details." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("grcc_lms_student", student.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}