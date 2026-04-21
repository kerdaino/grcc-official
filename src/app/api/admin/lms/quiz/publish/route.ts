import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

const QUIZ_AVAILABILITY_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body?.id) {
    return NextResponse.json({ ok: false, message: "Missing quiz ID." }, { status: 400 });
  }

  if (typeof body?.is_published !== "boolean") {
    return NextResponse.json(
      { ok: false, message: "Quiz publish status is required." },
      { status: 400 }
    );
  }

  const nextState = body.is_published
    ? {
        is_published: true,
        published_at: new Date().toISOString(),
        available_until: new Date(Date.now() + QUIZ_AVAILABILITY_WINDOW_MS).toISOString(),
      }
    : {
        is_published: false,
        published_at: null,
        available_until: null,
      };

  const { error } = await supabaseServer
    .from("sod_quizzes")
    .update(nextState)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
