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

  const { id, is_live } = await req.json();

  if (!id || typeof is_live !== "boolean") {
    return NextResponse.json(
      { ok: false, message: "Missing or invalid payload." },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("sod_live_class")
    .update({
      is_live,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}