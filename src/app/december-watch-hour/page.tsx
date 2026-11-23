import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import PageHero from "@/components/PageHero";
import { ARRIVAL, EVENT_DATES, EVENT_NAME, FIRST_MIDNIGHT_NOTICE, SESSION_TIMES, VENUE } from "@/lib/watchHour";
import RegistrationForm from "./registration-form";

export const metadata: Metadata = { title: EVENT_NAME, description: "Register for Elevated Sight with Gloryrealm Christian Centre." };

const flyerAlt = "Official December Watch-Hour Camp Meeting flyer for Elevated Sight with Pastor Arome Iduh.";
const { props: landscapeFlyer } = getImageProps({
  src: "/images/watchhour.jpeg",
  alt: flyerAlt,
  width: 4160,
  height: 2971,
  sizes: "(min-width: 1152px) 330px, 30vw",
});

export default function WatchHourPage() {
  return (
    <main className="text-slate-900">
      <PageHero title={EVENT_NAME} subtitle="Elevated Sight" />
      <section className="bg-slate-50 px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm md:p-7">
            <a href="#camp-registration" className="inline-block rounded-lg bg-fuchsia-800 px-4 py-2 font-semibold text-white hover:bg-fuchsia-900 lg:hidden">Go to registration</a>
            <picture>
              <source media="(min-width: 1024px)" srcSet={landscapeFlyer.srcSet} sizes={landscapeFlyer.sizes} width={4160} height={2971} />
              <Image src="/images/watchhourmobile.jpeg" alt={flyerAlt} width={1080} height={1080} sizes="(min-width: 768px) calc(100vw - 7rem), calc(100vw - 5rem)" className="h-auto w-full rounded-xl" />
            </picture>
            <h2 className="text-2xl font-extrabold">{EVENT_DATES}</h2>
            <p>Join Gloryrealm Christian Centre for 21 days of prayer with Pastor Arome Iduh.</p>
            <div>
              <h3 className="font-bold">Daily schedule</h3>
              <p>{SESSION_TIMES[0]}</p>
              <p>{SESSION_TIMES[1]}</p>
              <p className="mt-2">12 hours daily. {ARRIVAL} {FIRST_MIDNIGHT_NOTICE}</p>
            </div>
            <div>
              <h3 className="font-bold">Venue</h3>
              <address className="not-italic">{VENUE}</address>
            </div>
            <div>
              <h3 className="font-bold">Contact</h3>
              <a className="block text-fuchsia-800 underline" href="tel:+2347033073014">07033073014</a>
              <a className="block text-fuchsia-800 underline" href="tel:+2347011780857">07011780857</a>
            </div>
          </div>
          <RegistrationForm />
        </div>
      </section>
    </main>
  );
}
