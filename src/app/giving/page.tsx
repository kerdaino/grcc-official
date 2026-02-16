import PageHero from "@/components/PageHero";

export default function GivingPage() {
  return (
    <main>
      <PageHero
        title="Giving"
        subtitle="Support the mission. Your generosity helps us reach more souls."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 md:grid-cols-2">
          {/* Give online */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">Give Online</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              (Frontend only for now. Later we can connect Paystack/Flutterwave if needed.)
            </p>

            <div className="mt-6 space-y-3">
              <button className="w-full rounded-lg bg-teal-600 px-5 py-3 text-white font-semibold hover:bg-teal-700">
                Give Tithe
              </button>
              <button className="w-full rounded-lg bg-purple-600 px-5 py-3 text-white font-semibold hover:bg-purple-700">
                Give Offering
              </button>
              <button className="w-full rounded-lg border border-slate-300 px-5 py-3 text-slate-900 font-semibold hover:bg-slate-50">
                Partner / Support
              </button>
            </div>
          </div>

          {/* Other ways */}
          <div className="rounded-2xl border bg-slate-50 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Other Ways to Give</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              You can give via bank transfer using the account details below.
            </p>

            <div className="mt-6 rounded-xl border bg-white p-6">
              <p className="text-sm text-slate-500">Account Name</p>
              <p className="font-bold text-slate-900">Gloryrealm Christian Centre</p>

              <div className="mt-4">
                <p className="text-sm text-slate-500">Bank</p>
                <p className="font-semibold text-slate-900">Bank Name Here</p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-slate-500">Account Number</p>
                <p className="font-semibold text-slate-900">0000000000</p>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-600">
              Update these details to the correct ones later.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
