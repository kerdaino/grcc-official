import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.\-_]/g, "");
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("grcc_admin")?.value === "1";

  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { ok: false, message: "No file uploaded" },
      { status: 400 }
    );
  }

  const isAudio = file.type.startsWith("audio/");
  const hasAudioExtension = /\.(mp3|m4a|wav|ogg|aac)$/i.test(file.name);

  if (!isAudio && !hasAudioExtension) {
    return NextResponse.json(
      { ok: false, message: "Please upload an audio file" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `audio/${Date.now()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabaseServer.storage
    .from("sermons")
    .upload(fileName, buffer, {
      contentType: file.type || "audio/mpeg",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { ok: false, message: uploadError.message },
      { status: 500 }
    );
  }

  const { data } = supabaseServer.storage
    .from("sermons")
    .getPublicUrl(fileName);

  return NextResponse.json({
    ok: true,
    url: data.publicUrl,
  });
}
