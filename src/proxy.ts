import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin login page
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get("grcc_admin");

  // Protect admin routes
  if (!adminCookie && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};