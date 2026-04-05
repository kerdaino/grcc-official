import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminCookie = request.cookies.get("grcc_admin");
  const lmsCookie = request.cookies.get("grcc_lms_student");

  if (pathname === "/admin") {
    return NextResponse.next();
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