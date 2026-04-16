import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const durationMinutes = Number(body?.duration_minutes);

  if (!body?.title?.trim()) {
    return NextResponse.json({ ok: false, message: "Quiz title is required." }, { status: 400 });
  }

  const { error } = await supabaseServer.from("sod_quizzes").insert([
    {
      title: body.title.trim(),
      description: body.description?.trim() || "",
      duration_minutes:
        Number.isFinite(durationMinutes) && durationMinutes > 0
          ? Math.floor(durationMinutes)
          : 20,
      is_published: body.is_published ?? true,
    },
  ]);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
