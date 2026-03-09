import PageHero from "@/components/PageHero";

export default function PrivacyPage() {
  return (
    <main>
      <PageHero title="Privacy Policy" />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 space-y-6 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900">
            Privacy Policy
          </h2>

          <p>
            Gloryrealm Christian Centre respects your privacy. This policy explains
            how we collect, use, and protect your information when you interact
            with our website.
          </p>

          <h3 className="text-xl font-semibold text-slate-900">
            Information We Collect
          </h3>

          <p>
            We may collect personal information such as your name, email address,
            and other information you voluntarily provide when filling out forms
            such as School of Discovery registration or newsletter subscription.
          </p>

          <h3 className="text-xl font-semibold text-slate-900">
            How We Use Your Information
          </h3>

          <ul className="list-disc pl-6 space-y-2">
            <li>To process applications and registrations.</li>
            <li>To send updates about church events and activities.</li>
            <li>To respond to inquiries or prayer requests.</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900">
            Data Protection
          </h3>

          <p>
            We do not sell or distribute your personal information to third
            parties. Your information is securely stored and used only for
            ministry purposes.
          </p>

          <p>
            If you have any questions regarding this privacy policy, please
            contact us through the contact page.
          </p>
        </div>
      </section>
    </main>
  );
}