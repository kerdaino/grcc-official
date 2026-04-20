import PageHero from "@/components/PageHero";
import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const revalidate = 300;

type Sermon = {
  id: string;
  title: string;
  slug: string;
  preacher: string | null;
  sermon_date: string | null;
  summary: string | null;
  thumbnail_url: string | null;
};

export default async function SermonsPage() {
  const { data, error } = await supabaseServer
    .from("sermons")
    .select("id, title, slug, preacher, sermon_date, summary, thumbnail_url")
    .eq("is_published", true)
    .order("sermon_date", { ascending: false });

  const rows: Sermon[] = error ? [] : data || [];

  return (
    <main>
      <PageHero
        title="Sermons"
        subtitle="Watch and listen to recent messages."
        image="/images/sermons.jpg"
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          {rows.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-600">
              No published sermons yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {rows.map((s, index) => (
                <Link
                  key={s.id}
                  href={`/sermons/${s.slug}`}
                  className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {s.thumbnail_url ? (
                      <Image
                        src={s.thumbnail_url}
                        alt={s.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        quality={75}
                        priority={index < 3}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-500">
                        No Thumbnail
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-slate-500">
                      {s.sermon_date || "—"}
                      {s.preacher ? ` • ${s.preacher}` : ""}
                    </p>

                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-slate-900">
                      {s.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                      {s.summary || "Click to watch this message."}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-fuchsia-700">
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
