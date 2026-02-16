import PageHero from "@/components/PageHero";

export default function AboutPage() {
  return (
    <main>
      <PageHero
        title="About"
        subtitle="Learn more about Gloryrealm Christian Centre, our mandate, and our community."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Our Story</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              (Paste the church story content here later.)
            </p>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-8">
            <h3 className="font-bold text-slate-900">Service Times</h3>
            <p className="mt-3 text-slate-600">Sundays: 10:00 AM</p>
            <p className="text-slate-600">Thursdays: 6:00 PM</p>

            <h3 className="mt-6 font-bold text-slate-900">Location</h3>
            <p className="mt-3 text-slate-600">
              5 Moses Somefun Street, Adekoya Estate, College Rd.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
