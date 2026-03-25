import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { InterviewSummary } from "@/app/types";
import { recordTokenUsage } from "@/lib/credits";

const client = new Anthropic();

const SUGGESTIONS_PROMPT = `You are a startup advisor. Given a stress test summary of a startup idea, provide concrete, actionable suggestions for how to improve each area.

For each strength, suggest how to double down on it or leverage it further.
For each weakness, suggest a specific action to address it.
For each critical unknown, suggest how to validate or resolve it.

Respond ONLY with valid JSON in this exact format:
{
  "strengths": ["suggestion for strength 1", "suggestion for strength 2"],
  "weaknesses": ["suggestion for weakness 1", "suggestion for weakness 2"],
  "criticalUnknowns": ["suggestion for unknown 1", "suggestion for unknown 2"]
}

Keep each suggestion to 1-2 sentences. Be specific and actionable, not generic.`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { summary, sessionId } = (await request.json()) as {
      summary: InterviewSummary;
      sessionId?: string;
    };

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SUGGESTIONS_PROMPT,
      messages: [
        {
          role: "user",
          content: JSON.stringify(summary),
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code fences if present (handles ```json, ``` json, etc.)
    const cleaned = text.trim().replace(/^```\s*(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned);

    // Track token usage (fire-and-forget)
    recordTokenUsage(
      userId,
      sessionId || null,
      "suggestions",
      response.usage.input_tokens,
      response.usage.output_tokens,
      "claude-sonnet-4-6"
    ).catch(() => {});

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
