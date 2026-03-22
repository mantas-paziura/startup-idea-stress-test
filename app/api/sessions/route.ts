import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Session } from "@/app/types";

const DATA_DIR = path.join(process.cwd(), "data", "sessions");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(userId: string) {
  // Sanitize userId to prevent path traversal
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, `${safe}.json`);
}

async function readSessions(userId: string): Promise<Session[]> {
  try {
    const data = await fs.readFile(filePath(userId), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSessions(userId: string, sessions: Session[]) {
  await ensureDir();
  await fs.writeFile(filePath(userId), JSON.stringify(sessions, null, 2));
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await readSessions(userId);
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idea, summary } = await request.json();
  const sessions = await readSessions(userId);

  const session: Session = {
    id: crypto.randomUUID(),
    idea,
    summary,
    createdAt: new Date().toISOString(),
  };

  sessions.unshift(session);

  // Keep last 50 sessions
  if (sessions.length > 50) sessions.length = 50;

  await writeSessions(userId, sessions);
  return NextResponse.json(session);
}
