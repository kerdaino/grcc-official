import PageHero from "@/components/PageHero";

export default function TermsPage() {
  return (
    <main>
      <PageHero title="Terms of Use" />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 space-y-6 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900">
            Terms of Use
          </h2>

          <p>
            By accessing and using this website, you agree to the following terms
            and conditions.
          </p>

          <h3 className="text-xl font-semibold text-slate-900">
            Website Content
          </h3>

          <p>
            All content including sermons, articles, and media published on this
            site belong to Gloryrealm Christian Centre unless otherwise stated.
          </p>

          <h3 className="text-xl font-semibold text-slate-900">
            Acceptable Use
          </h3>

          <ul className="list-disc pl-6 space-y-2">
            <li>Do not misuse forms or submit false information.</li>
            <li>Do not attempt to disrupt the website.</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900">
            Changes
          </h3>

          <p>
            We may update these terms at any time without prior notice.
          </p>
        </div>
      </section>
    </main>
  );
}