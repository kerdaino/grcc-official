import PageHero from "@/components/PageHero";
import Link from "next/link";

function getYouTubeId(url: string) {
  // supports: watch?v=, youtu.be/, embed/
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch?.[1]) return watch[1];

  const short = url.match(/youtu\.be\/([^?]+)/);
  if (short?.[1]) return short[1];

  const embed = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embed?.[1]) return embed[1];

  return "";
}

export default async function SermonSinglePage({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/sermons/by-slug`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: params.slug }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    return (
      <main>
        <PageHero title="Sermon Not Found" subtitle="This message may not be published yet." />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <Link href="/sermons" className="text-fuchsia-700 font-semibold hover:underline">
            ← Back to Sermons
          </Link>
        </div>
      </main>
    );
  }

  const s = data.row;
  const youtubeId = s.youtube_url ? getYouTubeId(s.youtube_url) : "";

  return (
    <main>
      <PageHero title={s.title} subtitle={s.preacher ? `By ${s.preacher}` : ""} />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Date: {s.sermon_date || "—"}
            </span>
            {s.scripture ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Scripture: {s.scripture}
              </span>
            ) : null}
          </div>

          {youtubeId ? (
            <div className="mt-6 overflow-hidden rounded-2xl border">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={s.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              No YouTube video attached yet.
            </div>
          )}

          {s.summary ? (
            <div className="mt-8 rounded-2xl border bg-white p-6">
              <h2 className="text-xl font-extrabold text-slate-900">Summary</h2>
              <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {s.summary}
              </p>
            </div>
          ) : null}

          <div className="mt-10">
            <Link
              href="/sermons"
              className="inline-flex rounded-lg border px-5 py-3 font-semibold hover:bg-slate-50"
            >
              ← Back to Sermons
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}