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

  if (!body?.id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("gallery")
    .update({
      title: body.title?.trim() || "",
      image_url: body.image_url?.trim() || "",
      is_published: body.is_published ?? false,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}