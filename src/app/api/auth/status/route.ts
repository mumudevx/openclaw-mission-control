import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAuthConfigured, readCredentials } from '@/lib/auth/credentials';
import { verifyToken, COOKIE_NAME } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isAuthConfigured();

  if (!configured) {
    return NextResponse.json({ configured: false, authenticated: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ configured: true, authenticated: false });
  }

  const credentials = readCredentials();
  if (!credentials) {
    return NextResponse.json({ configured: true, authenticated: false });
  }

  const valid = await verifyToken(token, credentials.jwtSecret);
  return NextResponse.json({ configured: true, authenticated: valid });
}
