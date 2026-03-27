import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import type { Session } from "@/app/types";

function toSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    idea: row.idea as string,
    status: row.status as "in-progress" | "completed",
    summary: row.summary as Session["summary"],
    messages: (row.messages as Session["messages"]) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(toSession));
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { idea, summary, status = "in-progress" } = await request.json();

  const { data, error } = await getSupabase()
    .from("sessions")
    .insert({
      user_id: userId,
      idea,
      status,
      summary: summary || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toSession(data));
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, summary, messages } = await request.json();

  const updateData: Record<string, unknown> = {};
  if (summary) {
    updateData.status = "completed";
    updateData.summary = summary;
  }
  if (messages) {
    updateData.messages = messages;
  }

  const { data, error } = await getSupabase()
    .from("sessions")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(toSession(data));
}
