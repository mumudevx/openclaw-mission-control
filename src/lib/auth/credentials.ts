import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

interface StoredCredentials {
  username: string;
  passwordHash: string;
  salt: string;
  jwtSecret: string;
  createdAt: string;
}

const DATA_DIR = join(process.cwd(), 'data');
const CREDENTIALS_PATH = join(DATA_DIR, 'auth.json');

export function isAuthConfigured(): boolean {
  return existsSync(CREDENTIALS_PATH);
}

export function readCredentials(): StoredCredentials | null {
  if (!existsSync(CREDENTIALS_PATH)) return null;
  try {
    const raw = readFileSync(CREDENTIALS_PATH, 'utf-8');
    return JSON.parse(raw) as StoredCredentials;
  } catch {
    return null;
  }
}

export function writeCredentials(
  username: string,
  passwordHash: string,
  salt: string,
): StoredCredentials {
  const jwtSecret = randomBytes(64).toString('hex');
  const credentials: StoredCredentials = {
    username,
    passwordHash,
    salt,
    jwtSecret,
    createdAt: new Date().toISOString(),
  };

  if (!existsSync(DATA_DIR)) {
    const { mkdirSync } = require('fs') as typeof import('fs');
    mkdirSync(DATA_DIR, { recursive: true });
  }

  writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2), 'utf-8');
  return credentials;
}
