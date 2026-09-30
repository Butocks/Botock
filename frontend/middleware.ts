import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Only this email can access admin panel
const ADMIN_EMAIL = "butoameeralibuto@gmail.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (but not /admin/login itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminToken = request.cookies.get("botock_admin_token")?.value;
    const adminEmail = request.cookies.get("botock_admin_email")?.value;

    // No token or wrong email → immediately redirect, no flash
    if (!adminToken || adminEmail?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
