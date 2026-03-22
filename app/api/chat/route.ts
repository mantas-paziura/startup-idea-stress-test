import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { ChatResponse } from "@/app/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a YC partner conducting a fast, high-signal startup interview.

Your goal:
- Identify weaknesses in the founder's thinking
- Force clarity and specificity
- Help the founder think better — NOT think for them

Rules:
- Be direct but respectful
- Ask ONE question at a time
- If an answer is vague or broad, ask a follow-up before moving on
- Keep all responses to 1–2 sentences
- Never give long explanations or encouragement fluff
- Cover these 7 themes naturally (adapt, don't script):
  1. Problem
  2. Target customer
  3. Pain severity
  4. Existing alternatives
  5. Solution
  6. Go-to-market (first 100 users)
  7. Founder-market fit

When all themes have been meaningfully covered, respond ONLY with valid JSON:
{
  "interviewDone": true,
  "summary": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "criticalUnknowns": ["..."],
    "mostImportantNextQuestion": "..."
  }
}

Do not add any text outside the JSON when ending the interview.`;

function parseCompletionResponse(text: string): ChatResponse {
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.interviewDone === true && parsed.summary) {
      return {
        reply: trimmed,
        interviewDone: true,
        summary: parsed.summary,
      };
    }
  } catch {
    // Not JSON — normal conversational reply
  }
  return { reply: trimmed, interviewDone: false, summary: null };
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const chatResponse = parseCompletionResponse(text);

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
