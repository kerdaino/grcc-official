import { NextResponse } from "next/server";

import { WATCH_HOUR_ADMIN_COOKIE } from "@/lib/watchHourAdmin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("grcc_admin", "", { path: "/", maxAge: 0 });
  res.cookies.set(WATCH_HOUR_ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
