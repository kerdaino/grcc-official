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

  const videoType = body?.video_type === "embed" ? "embed" : "url";

  if (!body?.title?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Title is required." },
      { status: 400 }
    );
  }

  if (videoType === "url" && !body?.recording_url?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Recording URL is required." },
      { status: 400 }
    );
  }

  if (videoType === "embed" && !body?.embed_code?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Embed code is required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("sod_recordings").insert([
    {
      title: body.title.trim(),
      video_type: videoType,
      recording_url: videoType === "url" ? body.recording_url.trim() : "",
      embed_code: videoType === "embed" ? body.embed_code.trim() : "",
      session_date: body.session_date || null,
      instructor: body.instructor?.trim() || "",
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