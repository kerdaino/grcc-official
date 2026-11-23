import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import { ARRIVAL, EVENT_DATES, EVENT_NAME, SESSION_TIMES, VENUE } from "@/lib/watchHour";
import RegistrationForm from "./registration-form";

export const metadata: Metadata = { title: EVENT_NAME, description: "Register for Elevated Sight with Gloryrealm Christian Centre." };

const flyerAlt = "Official December Watch-Hour Camp Meeting flyer for Elevated Sight with Pastor Arome Iduh.";
const { props: landscapeFlyer } = getImageProps({
  src: "/images/watchhour.jpeg",
  alt: flyerAlt,
  width: 4160,
  height: 2971,
  sizes: "(min-width: 1152px) 629px, calc((100vw - 104px) * 0.6)",
});

export default function WatchHourPage() {
  return (
    <main className="text-slate-900">
      <section aria-labelledby="watch-hour-title" className="bg-gradient-to-br from-slate-950 via-slate-950 to-fuchsia-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 pb-5 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10 lg:px-8 lg:py-10">
          <div className="text-center lg:text-left">
            <h1 id="watch-hour-title" className="mx-auto max-w-lg text-balance text-xl font-extrabold leading-tight lg:mx-0 lg:text-4xl xl:text-5xl">{EVENT_NAME}</h1>
            <p className="mt-1 font-semibold text-fuchsia-200 lg:mt-3 lg:text-xl">Theme: Elevated Sight</p>
            <a href="#camp-registration" className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-fuchsia-800 px-5 py-2 font-semibold text-white hover:bg-fuchsia-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:mt-6">
              Go to registration
            </a>
          </div>
          <picture className="mx-auto block w-full max-w-[640px] lg:mx-0 lg:max-w-none">
            <source media="(min-width: 1024px)" srcSet={landscapeFlyer.srcSet} sizes={landscapeFlyer.sizes} width={4160} height={2971} />
            <Image
              src="/images/watchhourmobile.jpeg"
              alt={flyerAlt}
              width={1080}
              height={1080}
              sizes="(min-width: 672px) 640px, calc(100vw - 32px)"
              loading="eager"
              fetchPriority="high"
              className="block h-auto w-full rounded-lg"
            />
          </picture>
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-10 md:py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-2xl font-extrabold">{EVENT_DATES}</h2>
            <p>Join Gloryrealm Christian Centre for 21 days of prayer with Pastor Arome Iduh.</p>
            <div>
              <h3 className="font-bold">Daily schedule</h3>
              <p>{SESSION_TIMES[0]}</p>
              <p>{SESSION_TIMES[1]}</p>
              <p className="mt-2">{ARRIVAL}</p>
            </div>
            <div>
              <h3 className="font-bold">Venue</h3>
              <address className="not-italic">{VENUE}</address>
            </div>
            <div>
              <h3 className="font-bold">Contact</h3>
              <ul className="mt-1 grid gap-1">
                <li><a className="inline-flex min-h-11 items-center text-fuchsia-800 underline" href="tel:+2347033073014">07033073014</a></li>
                <li><a className="inline-flex min-h-11 items-center text-fuchsia-800 underline" href="tel:+2347011780857">07011780857</a></li>
              </ul>
            </div>
          </div>
          <RegistrationForm />
        </div>
      </section>
    </main>
  );
}
