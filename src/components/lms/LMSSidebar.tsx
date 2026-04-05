"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/lms/dashboard", label: "Dashboard", icon: "fa-solid fa-house" },
  { href: "/lms/overview", label: "Course Overview", icon: "fa-solid fa-book-open" },
  { href: "/lms/schedule", label: "Schedule", icon: "fa-solid fa-calendar-days" },
  { href: "/lms/live-class", label: "Live Class", icon: "fa-solid fa-video" },
  { href: "/lms/recordings", label: "Recordings", icon: "fa-solid fa-circle-play" },
  { href: "/lms/quiz", label: "Quiz", icon: "fa-solid fa-file-pen" },
  { href: "/lms/exam", label: "Final Exam", icon: "fa-solid fa-graduation-cap" },
];

export default function LMSSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-r bg-slate-950 text-white md:w-72">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">
          GRCC LMS
        </p>
        <h2 className="mt-2 text-2xl font-extrabold">School of Discovery</h2>
        <p className="mt-2 text-sm text-white/70">Student Learning Portal</p>
      </div>

      <nav className="px-4 py-4">
        <div className="space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-slate-950"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <i className={link.icon} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}