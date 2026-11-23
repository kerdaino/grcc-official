import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const WATCH_HOUR_ADMIN_COOKIE = "grcc_watch_hour_admin";
export const WATCH_HOUR_SESSION_SECONDS = 8 * 60 * 60;

function signature(expires: string) {
  const secret = process.env.GRCC_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return createHmac("sha256", secret).update(`grcc-watch-hour-admin:${expires}`).digest("hex");
}

export function issueWatchHourSession() {
  const expires = String(Math.floor(Date.now() / 1000) + WATCH_HOUR_SESSION_SECONDS);
  const proof = signature(expires);
  return proof ? `${expires}.${proof}` : null;
}

export function verifyWatchHourSession(token?: string) {
  if (!token || !/^\d{10}\.[0-9a-f]{64}$/.test(token)) return false;
  const [expires, proof] = token.split(".");
  const expected = signature(expires);
  return !!expected && Number(expires) > Math.floor(Date.now() / 1000) &&
    timingSafeEqual(Buffer.from(proof, "hex"), Buffer.from(expected, "hex"));
}

export async function isWatchHourAdmin() {
  return verifyWatchHourSession((await cookies()).get(WATCH_HOUR_ADMIN_COOKIE)?.value);
}
