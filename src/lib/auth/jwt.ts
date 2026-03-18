import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'oc-session';
const TOKEN_EXPIRY = '7d';

function getSecret(jwtSecret: string): Uint8Array {
  return new TextEncoder().encode(jwtSecret);
}

export async function createToken(username: string, jwtSecret: string): Promise<string> {
  return new SignJWT({ sub: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret(jwtSecret));
}

export async function verifyToken(token: string, jwtSecret: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret(jwtSecret));
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
