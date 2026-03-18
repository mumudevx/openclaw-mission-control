import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'oc-session';

const PUBLIC_PATHS = ['/login', '/api/auth/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Always allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if auth is configured by looking for the session cookie or calling status
  // For performance, we verify the JWT directly in middleware
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // Check if auth is even configured — if not, allow access (first-time setup)
    try {
      const statusUrl = new URL('/api/auth/status', request.url);
      const statusRes = await fetch(statusUrl, {
        headers: { cookie: request.headers.get('cookie') || '' },
      });
      const status = await statusRes.json();

      if (!status.configured) {
        // No admin account yet — allow access for setup
        return NextResponse.next();
      }
    } catch {
      // If status check fails, allow access to prevent lockout
      return NextResponse.next();
    }

    // Auth is configured but no token — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT token
  try {
    // We need the secret from the credentials file, but middleware runs on Edge
    // So we fetch the status endpoint which does the full verification
    const statusUrl = new URL('/api/auth/status', request.url);
    const statusRes = await fetch(statusUrl, {
      headers: { cookie: request.headers.get('cookie') || '' },
    });
    const status = await statusRes.json();

    if (!status.configured) {
      return NextResponse.next();
    }

    if (!status.authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // On error, allow access to prevent lockout
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
