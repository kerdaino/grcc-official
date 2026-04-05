import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const { data: quiz, error: quizError } = await supabaseServer
    .from("sod_quizzes")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (quizError) {
    return NextResponse.json({ ok: false, message: quizError.message }, { status: 500 });
  }

  if (!quiz) {
    return NextResponse.json({ ok: true, quiz: null, questions: [] });
  }

  const { data: questions, error: qError } = await supabaseServer
    .from("sod_quiz_questions")
    .select("id, question, option_a, option_b, option_c, option_d")
    .eq("quiz_id", quiz.id)
    .order("created_at", { ascending: true });

  if (qError) {
    return NextResponse.json({ ok: false, message: qError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, quiz, questions: questions || [] });
}