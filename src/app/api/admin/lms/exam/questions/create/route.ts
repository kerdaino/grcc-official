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

  if (
    !body?.exam_id ||
    !body?.question?.trim() ||
    !body?.option_a?.trim() ||
    !body?.option_b?.trim() ||
    !body?.correct_option?.trim()
  ) {
    return NextResponse.json({ ok: false, message: "Missing required question fields." }, { status: 400 });
  }

  const { error } = await supabaseServer.from("sod_exam_questions").insert([
    {
      exam_id: body.exam_id,
      question: body.question.trim(),
      option_a: body.option_a.trim(),
      option_b: body.option_b.trim(),
      option_c: body.option_c?.trim() || "",
      option_d: body.option_d?.trim() || "",
      correct_option: body.correct_option.trim().toUpperCase(),
    },
  ]);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}