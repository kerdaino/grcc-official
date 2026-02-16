// All homepage sections based on your screenshots.
// We use placeholders for Blog, Sermons, Events until backend is ready.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  // 3 slides from /public/images
  const slides = ["/images/slide1.jpg", "/images/slide2.jpg", "/images/slide3.jpg"];

  const [active, setActive] = useState(0);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative">
      {/* Background slider */}
      <div className="relative h-[520px] w-full overflow-hidden">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* HERO CONTENT (centered like original) */}
        <div className="absolute inset-0 flex items-center pt-10">
          <div className="mx-auto w-full max-w-6xl px-4 text-center">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight">
              Welcome to Gloryrealm <br /> Christian Centre
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-white/85 text-lg">
              A vibrant place of worship, transformation, and revival. Join us in
              proclaiming the Gospel of Christ to all nations.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/sermons"
                className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
              >
                Watch Sermons
              </Link>

              <Link
                href="/events"
                className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Upcoming Events
              </Link>
            </div>

            {/* Down arrow (like original) */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => {
                  // scroll a bit down smoothly
                  window.scrollTo({ top: 600, behavior: "smooth" });
                }}
                className="grid h-12 w-12 place-items-center rounded-full bg-black/30 text-white hover:bg-black/45"
                aria-label="Scroll down"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Dots (optional) - keep it subtle */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === active ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM INFO BAR (matches your original screenshot style) */}
        <div className="absolute bottom-0 left-0 right-0 bg-teal-800/95 text-white">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="grid gap-3 md:grid-cols-3 md:items-center">
              {/* Next service */}
              <div className="flex items-center gap-3">
                <IconCalendar />
                <p className="text-sm">
                  <span className="font-semibold">Next Service:</span> Sunday at 09:00 AM
                </p>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 md:justify-center">
                <IconPin />
                <p className="text-sm">
                  Behind Make-Up Quarters, Oshola Junction, College Road, Ogba, Lagos, Nigeria.
                </p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 md:justify-end">
                <IconPhone />
                <p className="text-sm">+2347032078859</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Small inline icons (so you don’t need any library) */
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-9.7-1-17.5-8.8-18.5-18.5A2 2 0 0 1 3.2 1h3a2 2 0 0 1 2 1.7c.2 1.2.5 2.4.9 3.5a2 2 0 0 1-.5 2.1L7.4 9.5a16 16 0 0 0 7.1 7.1l1.2-1.2a2 2 0 0 1 2.1-.5c1.1.4 2.3.7 3.5.9A2 2 0 0 1 22 16.9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}


export function WhoWeAreSection() {
  const points = [
    "Spreading the Gospel through evangelism",
    "Equipping believers for ministry",
    "Fostering a culture of prayer and worship",
    "Operating in the prophetic to impact lives",
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 items-start">
          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900">
  Who We Are
  <span className="block mt-2 h-1 w-20 bg-teal-600" />
</h2>

            <p className="mt-4 text-slate-600 leading-relaxed">
              We are a Christ-centered community of believers, passionate about seeing
              God's kingdom, power, and glory fill the earth. As a non-denominational
              and outreach ministry, we are committed to:
            </p>

            <ul className="mt-6 space-y-4 text-slate-700">
              {points.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                    <i className="fa-solid fa-check text-[12px]" />
                  </span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="mt-8 inline-block rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
            >
              Learn More About Us
            </Link>
          </div>

          {/* RIGHT (CARDS) */}
          <div className="grid gap-6 sm:grid-cols-2">
            <FeatureCard
              title="Prayer"
              desc="We believe in the power of prayer to transform lives and circumstances."
              icon="fa-solid fa-person-praying"
              accent="border-l-teal-600"
              iconColor="text-teal-600"
            />

            <FeatureCard
              title="The Prophetic"
              desc="God speaks today through His Spirit to guide and encourage His people."
              icon="fa-solid fa-droplet"
              accent="border-l-purple-600"
              iconColor="text-purple-600"
            />

            <FeatureCard
              title="Equipping"
              desc="Training believers to fulfill their God-given purpose and calling."
              icon="fa-solid fa-briefcase"
              accent="border-l-fuchsia-600"
              iconColor="text-fuchsia-600"
            />

            <FeatureCard
              title="Evangelism"
              desc="Sharing the good news of Jesus Christ with our community and the world."
              icon="fa-solid fa-hand-holding-heart"
              accent="border-l-red-600"
              iconColor="text-red-600"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  accent,
  iconColor,
}: {
  title: string;
  desc: string;
  icon: string;
  accent: string;
  iconColor: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-7 shadow-md border border-slate-100 border-l-[6px] ${accent}
      transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg`}
    >
      {/* Icon sits above title like original */}
      <div className={`text-3xl ${iconColor}`}>
        <i className={icon} />
      </div>

      <h3 className="mt-4 font-extrabold text-[18px] text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-slate-600 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}



export function SupportMissionSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-purple-700 p-10 text-center text-white shadow">
          <h2 className="text-3xl font-extrabold">Support the Mission</h2>
          <p className="mt-3 text-white/85 max-w-3xl mx-auto">
            Your generosity empowers us to reach more souls, serve our community,
            and advance the Kingdom of God. Every gift makes a difference!
          </p>

          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link
              href="/giving"
              className="rounded-lg bg-white px-6 py-3 font-bold text-slate-900 hover:bg-slate-100"
            >
              Give Online
            </Link>
            <Link
              href="/giving"
              className="rounded-lg border border-white/50 px-6 py-3 font-bold hover:bg-white/10"
            >
              Other Ways to Give
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VerseOfDaySection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-teal-50/60 p-10 text-center shadow-sm">
          <h3 className="text-xl font-bold">Verse of the Day</h3>
          <p className="mt-4 italic text-slate-700 text-lg leading-relaxed">
            “For God so loved the world that he gave his one and only Son,
            that whoever believes in him shall not perish but have eternal life.”
          </p>
          <p className="mt-3 text-slate-600 font-semibold">John 3:16 (NIV)</p>
        </div>
      </div>
    </section>
  );
}

export function PlaceholderBlock({
  title,
  emptyText,
  viewAllHref,
}: {
  title: string;
  emptyText: string;
  viewAllHref: string;
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold">
            {title}
            <span className="block mt-2 h-1 w-14 bg-teal-600" />
          </h2>

          <Link href={viewAllHref} className="text-teal-700 font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="mt-10 grid place-items-center rounded-2xl border bg-slate-50 p-16 text-center">
          <p className="text-slate-600">{emptyText}</p>
        </div>
      </div>
    </section>
  );
}
