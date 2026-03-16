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

  if (!body?.id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  const payload: any = {
    title: body.title?.trim() || "",
    author: body.author?.trim() || "",
    excerpt: body.excerpt?.trim() || "",
    content: body.content?.trim() || "",
    cover_image_url: body.cover_image_url?.trim() || "",
    is_published: body.is_published ?? false,
  };

  payload.slug = body.slug?.trim()
    ? slugify(body.slug)
    : slugify(body.title || "");

  const { error } = await supabaseServer
    .from("blog_posts")
    .update(payload)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}