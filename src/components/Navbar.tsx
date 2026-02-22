"use client";

/**
 * Navbar (Desktop + Mobile)
 * - Desktop: links in the middle
 * - Mobile: hamburger toggles menu
 * - Active link highlight using pathname
 */

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  { name: "About", href: "/about" },
  { name: "Sermons", href: "/sermons" },
  { name: "Events", href: "/events" },
  { name: "Ministries", href: "/ministries" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
  { name: "School of Discovery", href: "/school-of-discovery" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Animated top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600" />

      <div className="bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Gloryrealm Christian Centre Logo"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />

            <div className="leading-tight">
              <p className="text-white font-semibold tracking-wide">GLORYREALM</p>
              <p className="text-[11px] text-white/60">CHRISTIAN CENTRE</p>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative text-sm font-medium group ${
                    active ? "text-fuchsia-400" : "text-white/85 hover:text-white"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-fuchsia-500 transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE (Give + Hamburger on mobile) */}
          <div className="flex items-center gap-3">
            {/* GIVE BUTTON */}
            <Link
              href="/giving"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-6 py-3 text-white font-semibold text-sm shadow hover:bg-fuchsia-700"
            >
              {/* hand-holding-heart style svg */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 8.5c-1.5-2-4.5-2-6 0-1.2 1.6-1 4 .6 5.4L12 19l5.4-5.1c1.6-1.4 1.8-3.8.6-5.4-1.5-2-4.5-2-6 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.5 13.5l4.2 4.2c.6.6 1.4.9 2.2.9H13c1.1 0 2-.9 2-2v-1.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 13.5h3.3c.9 0 1.7.6 1.9 1.5l.3 1.6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Give
            </Link>

            {/* MOBILE: hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white hover:bg-white/10"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? (
                // X icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU PANEL */}
        {open ? (
          <div className="md:hidden border-t border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-4 grid gap-1">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-white/10 text-fuchsia-300"
                        : "text-white/85 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}