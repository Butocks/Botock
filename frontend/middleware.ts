import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host.startsWith("www.")) {
    const newHost = host.replace(/^www\./, "");
    const url = request.nextUrl.clone();
    url.host = newHost;
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // Redirect legacy malformed crawler requests (e.g. /& and /$) cleanly to homepage
  const pathname = request.nextUrl.pathname;
  if (pathname === "/&" || pathname === "/$" || pathname === "/%26" || pathname === "/%24") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static Next.js assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

