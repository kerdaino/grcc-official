import PageHero from "@/components/PageHero";
import Link from "next/link";

type Sermon = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  preacher: string | null;
  sermon_date: string | null;
  scripture: string | null;
  summary: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
};

export default async function SermonsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/sermons/list`, {
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  const rows: Sermon[] = data?.rows || [];

  return (
    <main>
      <PageHero title="Sermons" subtitle="Watch and listen to recent messages." />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {rows.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              No published sermons yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {rows.map((s) => (
                <Link
                  key={s.id}
                  href={`/sermons/${s.slug}`}
                  className="group rounded-2xl border overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-44 bg-slate-200 overflow-hidden">
                    {/* If thumbnail_url exists show it, else show a fallback */}
                    {s.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.thumbnail_url}
                        alt={s.title}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-slate-500 text-sm">
                        No Thumbnail
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-slate-500">
                      {s.sermon_date ? s.sermon_date : "—"}{" "}
                      {s.preacher ? `• ${s.preacher}` : ""}
                    </p>

                    <h3 className="mt-2 font-extrabold text-slate-900 text-lg leading-snug">
                      {s.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {s.summary || "Click to watch this message."}
                    </p>

                    <p className="mt-4 text-fuchsia-700 font-semibold text-sm">
                      Watch → 
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}