import { NextResponse } from 'next/server';
import { appendFile, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const LOG_PATH = join(process.cwd(), '.debug', 'ws.jsonl');

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  const body = await req.json();
  const entries = body.batch ?? [body];
  const lines = entries
    .map((e: unknown) => JSON.stringify({ ...(e as Record<string, unknown>), _at: new Date().toISOString() }))
    .join('\n') + '\n';

  try {
    await appendFile(LOG_PATH, lines);
  } catch {
    const { mkdir } = await import('fs/promises');
    await mkdir(join(process.cwd(), '.debug'), { recursive: true });
    await appendFile(LOG_PATH, lines);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  try {
    const content = await readFile(LOG_PATH, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const recent = lines.slice(-500);
    return NextResponse.json({ lines: recent.map((l) => JSON.parse(l)) });
  } catch {
    return NextResponse.json({ lines: [] });
  }
}

export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  try {
    await writeFile(LOG_PATH, '');
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
