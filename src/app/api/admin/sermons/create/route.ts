import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body?.title?.trim()) {
    return NextResponse.json({ ok: false, message: "Title is required" }, { status: 400 });
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.title);

  const { error } = await supabaseServer.from("sermons").insert([
    {
      title: body.title.trim(),
      slug,
      preacher: body.preacher?.trim() || "",
      sermon_date: body.sermon_date || null,
      scripture: body.scripture?.trim() || "",
      summary: body.summary?.trim() || "",
      youtube_url: body.youtube_url?.trim() || "",
      audio_url: body.audio_url?.trim() || "",
      thumbnail_url: body.thumbnail_url?.trim() || "",
      is_published: body.is_published ?? false,
    },
  ]);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}