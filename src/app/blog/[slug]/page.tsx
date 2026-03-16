import PageHero from "@/components/PageHero";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import BlogComments from "@/components/BlogComments";

export default async function BlogSinglePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: post, error } = await supabaseServer
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post || error) {
    return (
      <main>
        <PageHero
          title="Post Not Found"
          subtitle="This post may not be published yet."
          image="/images/gallery3.jpg"
        />

        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Link
            href="/blog"
            className="font-semibold text-teal-700 hover:underline"
          >
            ← Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        title={post.title}
        subtitle={post.author ? `By ${post.author}` : "Blog Post"}
        image={post.cover_image_url || "/images/gallery3.jpg"}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            {post.cover_image_url ? (
              <div className="h-[320px] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="p-8">
              <h1 className="text-3xl font-extrabold text-slate-900">
                {post.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {new Date(post.created_at).toLocaleDateString()}
                {post.author ? ` • ${post.author}` : ""}
              </p>

              <div className="mt-8 whitespace-pre-wrap leading-relaxed text-slate-700">
                {post.content || "No content available."}
              </div>

              <div className="mt-10">
                <Link
                  href="/blog"
                  className="inline-flex rounded-lg border px-5 py-3 font-semibold hover:bg-slate-50"
                >
                  ← Back to Blog
                </Link>
              </div>
            </div>
          </article>
          <BlogComments postSlug={slug} />
        </div>
      </section>
    </main>
  );
}