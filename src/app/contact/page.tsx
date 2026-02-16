import PageHero from "@/components/PageHero";

export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Contact"
        subtitle="We’d love to hear from you. Reach us or send a message."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">
          {/* Left: Contact cards */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-slate-50 p-7">
              <h3 className="font-extrabold text-slate-900 text-lg">Contact Details</h3>

              <div className="mt-5 space-y-4 text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-teal-600 mt-0.5">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <p>5 Moses Somefun Street, Adekoya Estate, College Rd.</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <p>+2347032078859</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-envelope" />
                  </span>
                  <p>info@grccglobal.org</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-teal-600">
                    <i className="fa-solid fa-clock" />
                  </span>
                  <p>Sun: 10:00 AM | Thu: 6:00 PM</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-7">
              <h3 className="font-extrabold text-slate-900 text-lg">Directions</h3>
              <p className="mt-3 text-slate-600">
                Use Google Maps to get directions to the church location.
              </p>

              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700"
              >
                <i className="fa-solid fa-location-crosshairs" />
                Get Directions
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg">Send a Message</h3>
            <p className="mt-2 text-slate-600 text-sm">
              (Frontend only for now. Backend will be connected later.)
            </p>

            <form className="mt-6 space-y-4">
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                placeholder="Full Name"
              />
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                placeholder="Email Address"
                type="email"
              />
              <input
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400"
                placeholder="Phone Number"
              />
              <textarea
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-slate-400 min-h-[140px]"
                placeholder="Your Message"
              />

              <button
                type="button"
                className="w-full rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
