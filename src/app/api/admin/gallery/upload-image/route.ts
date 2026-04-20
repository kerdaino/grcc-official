import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  getGalleryImageSizeError,
  getGalleryImageTypeError,
} from "@/lib/galleryUpload";

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

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const typeError = getGalleryImageTypeError(file);

    if (typeError) {
      return NextResponse.json(
        { ok: false, message: typeError },
        { status: 400 }
      );
    }

    const sizeError = getGalleryImageSizeError(file);

    if (sizeError) {
      return NextResponse.json(
        { ok: false, message: sizeError },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabaseServer.storage
      .from("gallery")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Gallery image upload failed", {
        fileName,
        fileType: file.type,
        fileSize: file.size,
        message: uploadError.message,
      });

      return NextResponse.json(
        {
          ok: false,
          message: `Supabase storage upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    const { data } = supabaseServer.storage
      .from("gallery")
      .getPublicUrl(fileName);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
    });
  } catch (error) {
    console.error("Gallery image request processing failed", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Image upload failed before completion. The file may be too large or the request may have been interrupted.",
      },
      { status: 500 }
    );
  }
}
