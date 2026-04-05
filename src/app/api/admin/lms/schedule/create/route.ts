import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  if (!body?.title || !body?.session_date) {
    return NextResponse.json(
      { ok: false, message: "Title and session date are required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("sod_schedule").insert([
    {
      title: body.title.trim(),
      session_date: body.session_date,
      session_time: body.session_time?.trim() || "",
      instructor: body.instructor?.trim() || "",
      location: body.location?.trim() || "",
      description: body.description?.trim() || "",
      is_published: body.is_published ?? true,
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