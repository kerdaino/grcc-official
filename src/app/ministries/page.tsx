import Link from "next/link";
import PageHero from "@/components/PageHero";

// FRONTEND ONLY: placeholder ministries (backend will replace)
const ministries = [
  {
    slug: "prayer-ministry",
    title: "Prayer Ministry",
    excerpt: "Join a people committed to intercession and building spiritual strength.",
  },
  {
    slug: "evangelism",
    title: "Evangelism",
    excerpt: "Sharing the Gospel of Jesus Christ with our community and the world.",
  },
  {
    slug: "discipleship-equipping",
    title: "Discipleship & Equipping",
    excerpt: "Training believers to fulfill their God-given purpose and calling.",
  },
  {
    slug: "prophetic-ministry",
    title: "The Prophetic",
    excerpt: "God speaks today through His Spirit to guide and encourage His people.",
  },
];

export default function MinistriesPage() {
  return (
    <main>
      <PageHero
        title="Ministries"
        subtitle="Discover where you can serve, grow, and belong."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {ministries.map((m) => (
              <Link
                key={m.slug}
                href={`/ministries/${m.slug}`}
                className="group rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-extrabold text-slate-900">
                  {m.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  {m.excerpt}
                </p>

                <div className="mt-6 font-semibold text-teal-700">
                  Learn More →
                </div>

                {/* subtle accent bar like the original style */}
                <div className="mt-6 h-1 w-14 bg-teal-600 transition group-hover:w-20" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
