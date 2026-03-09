import PageHero from "@/components/PageHero";
import Link from "next/link";

export default function SitemapPage() {
  const links = [
    ["Home", "/"],
    ["About", "/about"],
    ["Sermons", "/sermons"],
    ["Events", "/events"],
    ["Ministries", "/ministries"],
    ["Gallery", "/gallery"],
    ["Blog", "/blog"],
    ["Giving", "/giving"],
    ["Contact", "/contact"],
    ["School of Discovery", "/school-of-discovery"],
  ];

  return (
    <main>
      <PageHero title="Site Map" />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <ul className="space-y-4 text-slate-700">
            {links.map(([name, link]) => (
              <li key={link}>
                <Link
                  href={link}
                  className="text-lg hover:text-fuchsia-600"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}