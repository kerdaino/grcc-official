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

  if (!body?.title?.trim()) {
    return NextResponse.json(
      { ok: false, message: "Title is required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("sod_live_class").insert([
    {
      title: body.title.trim(),
      zoom_link: body.zoom_link?.trim() || "",
      meeting_id: body.meeting_id?.trim() || "",
      passcode: body.passcode?.trim() || "",
      instructions: body.instructions?.trim() || "",
      is_live: body.is_live ?? false,
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