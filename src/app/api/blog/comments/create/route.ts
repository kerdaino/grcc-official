import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  const body = await req.json();

  if (!body?.post_slug || !body?.author_name || !body?.body) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!isAdmin) {
    const token = body?.turnstileToken;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Spam protection token is missing." },
        { status: 400 }
      );
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      }
    );

    const verifyData = await verifyRes.json().catch(() => null);

    if (!verifyRes.ok || !verifyData?.success) {
      return NextResponse.json(
        { ok: false, message: "Spam protection verification failed." },
        { status: 400 }
      );
    }
  }

  const { error } = await supabaseServer.from("blog_comments").insert([
    {
      post_slug: body.post_slug,
      parent_id: body.parent_id || null,
      author_name: body.author_name.trim(),
      author_email: body.author_email?.trim() || "",
      body: body.body.trim(),
      is_admin: isAdmin,
      is_deleted: false,
      is_approved: isAdmin ? true : false,
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