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

  if (!body?.id || !body?.status) {
    return NextResponse.json(
      { ok: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!["pending", "approved", "rejected"].includes(body.status)) {
    return NextResponse.json(
      { ok: false, message: "Invalid status" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer
    .from("ministries_applications")
    .update({ status: body.status })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}