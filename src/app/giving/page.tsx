import PageHero from "@/components/PageHero";
import GivingDetailsCard from "./GivingDetailsCard";

const nairaAccount = {
  title: "Naira Account",
  accountName: "Gloryrealm Christian Centre",
  bank: "Access Bank",
  accountNumber: "1917160885",
};

const dollarAccount = {
  title: "Dollar Account",
  accountName: "Gloryrealm Christian Centre",
  bank: "Access Bank",
  accountNumber: "1917918141",
  swift: "ABNGNGL",
  routing: "021000089",
};

export default function GivingPage() {
  return (
    <main>
      <PageHero
        title="Offering, Tithes & Support"
        subtitle="Members and partners can give simply and securely through bank transfer."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-stone-50 to-teal-50/40 shadow-sm">
            <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Support the Ministry
                </p>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Give / Support the Ministry
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Thank you for supporting the work of the ministry through your
                  giving. Members, friends, and partners can give via bank
                  transfer using the account details below.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Ministry Name
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      Gloryrealm Christian Centre
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Giving Covers
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-slate-700">
                      Tithes, offerings, thanksgiving, and partnership support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Bank Transfer
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                      Account Details
                    </h2>
                  </div>

                  <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    Bank Transfer
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Use the account details below for your giving. Please double-check
                  the currency account you intend to send to before making a transfer.
                </p>

                <div className="mt-6 space-y-4">
                  <GivingDetailsCard {...nairaAccount} />
                  <GivingDetailsCard {...dollarAccount} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
