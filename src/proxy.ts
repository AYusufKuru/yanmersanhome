import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName } from "@/lib/session-cookie";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/giris") {
    return NextResponse.next();
  }

  if (!request.cookies.has(sessionCookieName)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/giris";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
