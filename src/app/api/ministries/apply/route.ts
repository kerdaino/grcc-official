import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.full_name || !body.email) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("ministries_applications").insert([
    {
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      department: body.department,
      reason: body.reason,
    },
  ]);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}