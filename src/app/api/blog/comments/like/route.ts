import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const comment_id =
      typeof body?.comment_id === "string" ? body.comment_id.trim() : "";
    const visitor_token =
      typeof body?.visitor_token === "string" ? body.visitor_token.trim() : "";

    if (!comment_id || !visitor_token) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer.from("blog_comment_likes").insert([
      {
        comment_id,
        visitor_token,
      },
    ]);

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique")
      ) {
        return NextResponse.json(
          { ok: false, message: "You already liked this comment." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }
}