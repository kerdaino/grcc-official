"use client";

import PageHero from "@/components/PageHero";
import Link from "next/link";

const adminLinks = [
  {
    title: "School of Discovery",
    desc: "Review applications, admit or reject applicants, and manage the onboarding workflow.",
    href: "/admin/school-of-discovery",
    color: "from-teal-600 to-cyan-600",
    icon: "fa-solid fa-graduation-cap",
  },
  {
    title: "Sermons",
    desc: "Create, edit, publish, unpublish, and remove sermon entries from the website.",
    href: "/admin/sermons",
    color: "from-fuchsia-600 to-purple-600",
    icon: "fa-solid fa-microphone-lines",
  },
  {
    title: "Blog",
    desc: "Manage blog posts, devotionals, updates, and future written content for the site.",
    href: "/admin/blog",
    color: "from-amber-500 to-orange-600",
    icon: "fa-solid fa-pen-nib",
  },
  {
    title: "Events",
    desc: "Add and manage upcoming services, special meetings, conferences, and church programs.",
    href: "/admin/events",
    color: "from-blue-600 to-indigo-600",
    icon: "fa-solid fa-calendar-days",
  },
  {
    title: "Gallery",
    desc: "Upload and organize service photos, event media, and future image collections.",
    href: "/admin/gallery",
    color: "from-pink-600 to-rose-600",
    icon: "fa-solid fa-images",
  },
  {
    title: "Ministries",
    desc: "Manage ministry/workforce information, pages, and future internal ministry updates.",
    href: "/admin/ministries",
    color: "from-emerald-600 to-green-600",
    icon: "fa-solid fa-people-group",
  },
  {
  title: "Contact Messages",
  desc: "View contact form submissions from visitors and respond to inquiries.",
  href: "/admin/contact",
  color: "from-cyan-600 to-sky-600",
  icon: "fa-solid fa-envelope-open-text",
},
{
  title: "LMS Schedule",
  desc: "Manage School of Discovery schedule, class dates, and session details.",
  href: "/admin/lms/schedule",
  color: "from-violet-600 to-purple-600",
  icon: "fa-solid fa-calendar-days",
},
{
  title: "LMS Live Class",
  desc: "Manage current Zoom class link, meeting details, and live status.",
  href: "/admin/lms/live-class",
  color: "from-emerald-600 to-teal-600",
  icon: "fa-solid fa-video",
},
{
  title: "LMS Recordings",
  desc: "Manage and publish School of Discovery class recordings.",
  href: "/admin/lms/recordings",
  color: "from-pink-600 to-rose-600",
  icon: "fa-solid fa-circle-play",
},
{
  title: "LMS Quiz",
  desc: "Create quizzes and add student assessment questions.",
  href: "/admin/lms/quiz",
  color: "from-amber-500 to-orange-600",
  icon: "fa-solid fa-file-pen",
},
];

export default function AdminDashboardPage() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <main>
      <PageHero
        title="Admin Dashboard"
        subtitle="Manage School of Discovery, sermons, events, blog content, gallery, and other site sections."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Welcome to GRCC Admin
              </h2>
              <p className="mt-2 text-slate-600">
                Choose a section below to continue managing the website.
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-900 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {adminLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`bg-gradient-to-r ${item.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-xl">
                      <i className={item.icon} />
                    </div>

                    <span className="text-sm font-semibold text-white/85">
                      Open
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>

                  <p className="mt-5 font-semibold text-fuchsia-700 group-hover:underline">
                    Go to section →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}