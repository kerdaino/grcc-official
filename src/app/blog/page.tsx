import Link from "next/link";
import PageHero from "@/components/PageHero";

const posts = [
  {
    slug: "welcome-to-grcc",
    title: "Welcome to Gloryrealm Christian Centre",
    date: "Feb 2026",
    excerpt: "A quick introduction to our community, mandate, and what to expect.",
  },
  {
    slug: "the-refiners-fire-notes",
    title: "The Refiner’s Fire — Key Notes",
    date: "Feb 2026",
    excerpt: "Highlights and takeaways from the Sunday service message.",
  },
];

export default function BlogPage() {
  return (
    <main>
      <PageHero title="Blog" subtitle="Articles, updates, and ministry notes." />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-slate-500">{p.date}</p>
                <h3 className="mt-2 font-extrabold text-slate-900">{p.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {p.excerpt}
                </p>
                <p className="mt-5 font-semibold text-teal-700">Read More →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
