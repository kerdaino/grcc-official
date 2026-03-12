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

  if (!body?.image_url?.trim()) {
    return NextResponse.json({ ok: false, message: "Image is required" }, { status: 400 });
  }

  const { error } = await supabaseServer.from("gallery").insert([
    {
      title: body.title?.trim() || "",
      image_url: body.image_url.trim(),
      is_published: body.is_published ?? false,
    },
  ]);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}