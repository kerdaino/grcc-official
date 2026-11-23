import Link from "next/link";
import PageHero from "@/components/PageHero";
import { isWatchHourAdmin } from "@/lib/watchHourAdmin";
import Dashboard from "./dashboard";

export default async function WatchHourAdminPage() {
  const authorized = await isWatchHourAdmin();
  return <main className="text-slate-900">
    <PageHero title="December Watch-Hour registrations" subtitle="Attendance, accommodation and welfare planning" />
    {authorized ? <Dashboard /> : <section className="mx-auto max-w-lg px-4 py-12 text-center">
      <p>Sign in with the GRCC admin password to continue. Camp access expires after eight hours.</p>
      <Link className="mt-4 inline-block rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white" href="/admin">Admin sign in</Link>
    </section>}
  </main>;
}
