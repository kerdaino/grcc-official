import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabaseServer";
import {
  HeroSection,
  WhoWeAreSection,
  SupportMissionSection,
} from "@/components/Sections";

const VERSES = [
  {
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reference: "Romans 8:28",
  },
  {
    text: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?",
    reference: "Psalm 27:1",
  },
  {
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    reference: "Proverbs 3:5",
  },
  {
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
    reference: "Isaiah 40:31",
  },
  {
    text: "Seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    reference: "Matthew 6:33",
  },
  {
    text: "Being confident of this very thing, that he which hath begun a good work in you will perform it until the day of Jesus Christ.",
    reference: "Philippians 1:6",
  },
  {
    text: "The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning.",
    reference: "Lamentations 3:22-23",
  },
];

type EventRow = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
};

type SermonRow = {
  id: string;
  title: string;
  slug: string;
  preacher: string | null;
  sermon_date: string | null;
  summary: string | null;
  thumbnail_url: string | null;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  created_at: string;
};

function getVerseOfDay() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return VERSES[diffDays % VERSES.length];
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function HomePage() {
  const verse = getVerseOfDay();

  const today = new Date().toISOString().split("T")[0];

  const [{ data: eventsData }, { data: sermonsData }, { data: blogData }] =
    await Promise.all([
      supabaseServer
        .from("events")
        .select("id,title,slug,event_date,event_time,location,image_url")
        .eq("is_published", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(3),

      supabaseServer
        .from("sermons")
        .select("id,title,slug,preacher,sermon_date,summary,thumbnail_url")
        .eq("is_published", true)
        .order("sermon_date", { ascending: false })
        .limit(3),

      supabaseServer
        .from("blog_posts")
        .select("id,title,slug,author,excerpt,cover_image_url,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const events: EventRow[] = eventsData || [];
  const sermons: SermonRow[] = sermonsData || [];
  const posts: BlogRow[] = blogData || [];

  return (
    <main>
      <HeroSection />
      <WhoWeAreSection />
      <SupportMissionSection />

      <VerseOfDayBlock text={verse.text} reference={verse.reference} />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeader
            title="Upcoming Events"
            href="/events"
            linkText="View All Events"
          />

          {events.length === 0 ? (
            <EmptyState text="No upcoming events at the moment. Check back soon for updates!" />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-600">
                        No Event Image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(event.event_date)}
                      {event.event_time ? ` • ${event.event_time}` : ""}
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                      {event.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {event.location || "Location not specified"}
                    </p>

                    <p className="mt-5 font-semibold text-fuchsia-700">
                      View Details →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeader
            title="Latest Sermons"
            href="/sermons"
            linkText="View All Sermons"
          />

          {sermons.length === 0 ? (
            <EmptyState text="No sermons available yet. Please check back later." />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {sermons.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${sermon.slug}`}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    {sermon.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-600">
                        No Thumbnail
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(sermon.sermon_date)}
                      {sermon.preacher ? ` • ${sermon.preacher}` : ""}
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                      {sermon.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {sermon.summary || "Click to watch this message."}
                    </p>

                    <p className="mt-5 font-semibold text-fuchsia-700">
                      Watch Now →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeader
            title="Recent Blog Posts"
            href="/blog"
            linkText="View All Posts"
          />

          {posts.length === 0 ? (
            <EmptyState text="No blog posts available yet." />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-52 overflow-hidden bg-slate-100">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-sm text-slate-600">
                        No Cover Image
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm font-medium text-slate-700">
                      {formatDate(post.created_at)}
                      {post.author ? ` • ${post.author}` : ""}
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold text-slate-900">
                      {post.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      {post.excerpt || "Read this post for more details."}
                    </p>

                    <p className="mt-5 font-semibold text-fuchsia-700">
                      Read More →
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

function VerseOfDayBlock({
  text,
  reference,
}: {
  text: string;
  reference: string;
}) {
  return (
    <section className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-xl md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
            Verse of the Day
          </p>

          <blockquote className="mt-5 text-xl font-medium leading-relaxed text-white md:text-2xl">
            “{text}”
          </blockquote>

          <p className="mt-5 text-base font-semibold text-teal-300">
            — {reference}
          </p>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  href,
  linkText,
}: {
  title: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-2 text-slate-700">
          Stay updated with what God is doing at Gloryrealm Christian Centre.
        </p>
      </div>

      <Link
        href={href}
        className="font-semibold text-fuchsia-700 hover:underline"
      >
        {linkText} →
      </Link>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-10 text-center text-slate-700">
      {text}
    </div>
  );
}