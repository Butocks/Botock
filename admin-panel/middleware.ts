import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allowedIp = process.env.ADMIN_ALLOWED_IP;
  if (allowedIp) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    if (ip !== allowedIp) {
      return new NextResponse(
        JSON.stringify({ error: 'Access Denied: IP not whitelisted', your_ip: ip }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }
  
  // Device verification could check for a specific cookie
  const deviceVerified = request.cookies.get('admin_device_verified');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  
  if (isDashboard && !deviceVerified) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
