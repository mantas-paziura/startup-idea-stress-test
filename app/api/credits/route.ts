import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOrCreateCredits } from "@/lib/credits";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { balance } = await getOrCreateCredits(userId);
  return NextResponse.json({ balance });
}
