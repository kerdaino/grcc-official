import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { post_slug } = await req.json();

  if (!post_slug) {
    return NextResponse.json(
      { ok: false, message: "Missing post_slug" },
      { status: 400 }
    );
  }

  const { data: comments, error } = await supabaseServer
    .from("blog_comments")
  .select("*")
  .eq("post_slug", post_slug)
  .eq("is_deleted", false)
  .eq("is_approved", true)
  .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }

  // get like counts
  const ids = (comments || []).map((c) => c.id);

  let likesMap: Record<string, number> = {};

  if (ids.length > 0) {
    const { data: likesData } = await supabaseServer
      .from("blog_comment_likes")
      .select("comment_id")
      .in("comment_id", ids);

    likesMap = (likesData || []).reduce((acc: Record<string, number>, row: any) => {
      acc[row.comment_id] = (acc[row.comment_id] || 0) + 1;
      return acc;
    }, {});
  }

  const rows = (comments || []).map((c) => ({
    ...c,
    likes_count: likesMap[c.id] || 0,
  }));

  return NextResponse.json({ ok: true, rows });
}