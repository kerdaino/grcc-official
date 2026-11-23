import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyWatchHourSession, WATCH_HOUR_ADMIN_COOKIE } from "@/lib/watchHourAdmin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get("grcc_admin");
  const lmsCookie = request.cookies.get("grcc_lms_student");

  if (pathname === "/admin") {
    return NextResponse.next();
  }

  if (pathname === "/admin/inaugural-service" || pathname.startsWith("/admin/inaugural-service/")) {
    const signedSession = request.cookies.get(WATCH_HOUR_ADMIN_COOKIE)?.value;
    return verifyWatchHourSession(signedSession)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!adminCookie && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (
    pathname.startsWith("/lms") &&
    pathname !== "/lms/login" &&
    !lmsCookie
  ) {
    return NextResponse.redirect(new URL("/lms/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/lms/:path*"],
};
