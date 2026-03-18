import { NextResponse } from 'next/server';
import { isAuthConfigured, writeCredentials } from '@/lib/auth/credentials';
import { hashPassword } from '@/lib/auth/hash';
import { createToken, COOKIE_NAME } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  if (isAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin account already exists' },
      { status: 409 },
    );
  }

  const body = await request.json();
  const { username, password } = body as { username?: string; password?: string };

  if (!username || username.length < 3) {
    return NextResponse.json(
      { error: 'Username must be at least 3 characters' },
      { status: 400 },
    );
  }

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 },
    );
  }

  const { hash, salt } = hashPassword(password);
  const credentials = writeCredentials(username, hash, salt);

  const token = await createToken(username, credentials.jwtSecret);

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
