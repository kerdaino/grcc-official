// src/components/Navbar.tsx
// Navbar with logo on the left, links center, Give button right (matches original layout)

"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <header className="sticky top-0 z-50">
      {/* Thin purple top line */}
      <div className="h-1 w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-fuchsia-600" />

      <div className="bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          {/* LOGO AREA */}
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
              <p className="text-white font-semibold tracking-wide">
                GLORYREALM
              </p>
              <p className="text-[11px] text-white/60">
                CHRISTIAN CENTRE
              </p>
            </div>
          </Link>

          {/* LINKS */}
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

        {/* underline: stays full for active, animates on hover for others */}
        <span
          className={`absolute left-0 -bottom-1 h-[2px] bg-fuchsia-500 transition-all duration-300 ${
            active ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  })}
          </nav>

 {/* GIVE BUTTON */}
<Link
  href="/giving"
  className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-600 px-6 py-3 text-white font-semibold text-sm shadow hover:bg-fuchsia-700"
>
  <i className="fa-solid fa-hand-holding-heart" />
  Give
</Link>

        </div>
      </div>
    </header>
  );
}
