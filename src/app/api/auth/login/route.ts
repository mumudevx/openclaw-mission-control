import { NextResponse } from 'next/server';
import { readCredentials } from '@/lib/auth/credentials';
import { verifyPassword } from '@/lib/auth/hash';
import { createToken, COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  const credentials = readCredentials();
  if (!credentials) {
    return NextResponse.json(
      { error: 'Auth not configured' },
      { status: 503 },
    );
  }

  const body = await request.json();
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 },
    );
  }

  if (
    username !== credentials.username ||
    !verifyPassword(password, credentials.passwordHash, credentials.salt)
  ) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 },
    );
  }

  const token = await createToken(username, credentials.jwtSecret);

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
