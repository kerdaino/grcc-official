// src/components/Footer.tsx
// Footer layout matching the screenshot: About (logo + socials), Quick Links, Contact, Newsletter, bottom bar links.

import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  ["About Us", "/about"],
  ["Sermons", "/sermons"],
  ["Events", "/events"],
  ["Ministries", "/ministries"],
  ["Gallery", "/gallery"],
  ["Blog", "/blog"],
  ["Giving", "/giving"],
] as const;

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-950 to-slate-950/95 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* About */}
          <div>
            <h4 className="font-bold text-lg text-white">About Us</h4>
            <div className="mt-2 h-1 w-12 bg-fuchsia-600" />

            <div className="mt-6 flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Gloryrealm Christian Centre"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div className="leading-tight">
                <p className="text-white font-semibold tracking-wide">GLORYREALM</p>
                <p className="text-[11px] text-white/60">CHRISTIAN CENTRE</p>
              </div>
            </div>

            <p className="mt-4 text-white/65 text-sm">
              Raising Glory Revealing Christians in Every Sphere of Influence
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-4 text-white/70">
              <a href="https://www.facebook.com/pastoraromeiduh" aria-label="Facebook" className="hover:text-white">
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a href="https://www.youtube.com/@GRCC_Global" aria-label="YouTube" className="hover:text-white">
                <i className="fa-brands fa-youtube" />
              </a>
              <a href="https://www.tiktok.com/@pastoraromeiduh" aria-label="tiktok" className="hover:text-white">
                <i className="fa-brands fa-tiktok" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-lg text-white">Quick Links</h4>
            <div className="mt-2 h-1 w-12 bg-fuchsia-600" />

            <ul className="mt-6 space-y-3 text-sm">
              {quickLinks.map(([name, href]) => (
                <li key={name}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 text-white/70 hover:text-white"
                  >
                    <span className="text-teal-400 group-hover:text-teal-300">
                      <i className="fa-solid fa-chevron-right text-[11px]" />
                    </span>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg text-white">Contact Us</h4>
            <div className="mt-2 h-1 w-12 bg-fuchsia-600" />

            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-teal-400">
                  <i className="fa-solid fa-location-dot" />
                </span>
                <p>Behind Make-Up Quarters, Oshola Junction, Near Oyemekun Bus Stop, College Road, Ogba, Lagos, Nigeria.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-teal-400">
                  <i className="fa-solid fa-phone" />
                </span>
                <p>+234 703 668 2410</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-teal-400">
                  <i className="fa-solid fa-envelope" />
                </span>
                <p></p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-teal-400">
                  <i className="fa-solid fa-clock" />
                </span>
                <p>Sun: 09:00 AM | Thu: 5:30 PM</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-lg text-white">Newsletter</h4>
            <div className="mt-2 h-1 w-12 bg-fuchsia-600" />

            <p className="mt-6 text-white/70 text-sm">
              Subscribe to get updates on events, sermons and more.
            </p>

            <div className="mt-4 space-y-3">
              <input
                placeholder="Your email address"
                className="w-full rounded-lg bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40 border border-white/10 focus:border-white/25"
              />

              <button className="w-full rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold hover:bg-fuchsia-700 inline-flex items-center justify-center gap-2">
                <i className="fa-solid fa-paper-plane" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-white/50 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} Gloryrealm Christian Centre. All rights reserved.
              <span className="block md:inline md:ml-2 text-white/35">
                Designed by Pinnacle tech hub
              </span>
              <span className="block md:inline md:ml-2 text-white/35">
                Developed by KD Global
              </span>
            </div>

            <div className="flex items-center gap-6 md:justify-end">
              <Link href="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms of Use
              </Link>
              <Link href="/sitemap" className="hover:text-white">
                Site Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
