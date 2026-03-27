"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Message, InterviewSummary, ChatResponse } from "@/app/types";
import ChatInterface from "@/components/ChatInterface";
import SummaryView from "@/components/SummaryView";
import ProgressBar from "@/components/ProgressBar";
import { usePostHog } from "@/lib/posthog";

async function sendToAPI(
  messages: Message[],
  sessionId: string | null
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      sessionId,
    }),
  });
  if (res.status === 402) {
    throw new Error("insufficient_credits");
  }
  if (!res.ok) throw new Error("Failed to get response");
  return res.json();
}

function estimateProgress(messages: Message[]): number {
  const assistantMessages = messages.filter((m) => m.role === "assistant").length;
  const estimated = Math.min(95, (assistantMessages / 8) * 100);
  return Math.round(estimated);
}

export default function InterviewPage() {
  const router = useRouter();
  const { capture } = usePostHog();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [outOfCredits, setOutOfCredits] = useState(false);
  const initializedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const progress = useMemo(() => {
    if (summary) return 100;
    return estimateProgress(messages);
  }, [messages, summary]);

  // Poll for credit recovery when out of credits
  useEffect(() => {
    if (!outOfCredits) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/credits");
        const data = await res.json();
        if (typeof data.balance === "number" && data.balance > 0) {
          setOutOfCredits(false);
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [outOfCredits]);

  const fetchReply = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    try {
      const response = await sendToAPI(allMessages, sessionIdRef.current);
      if (response.interviewDone && response.summary) {
        capture("interview_completed", {
          total_messages: allMessages.length,
          strengths_count: response.summary.strengths.length,
          weaknesses_count: response.summary.weaknesses.length,
        });
        setSummary(response.summary);

        // Update existing session to completed
        if (sessionIdRef.current) {
          fetch("/api/sessions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sessionIdRef.current,
              summary: response.summary,
            }),
          }).catch(() => {});
        } else {
          const idea = sessionStorage.getItem("startup-idea") || "";
          fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idea,
              summary: response.summary,
              status: "completed",
            }),
          }).catch(() => {});
        }
      } else {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "insufficient_credits") {
        setOutOfCredits(true);
        return;
      }
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [capture]);

  useEffect(() => {
    if (initializedRef.current) return;

    const idea = sessionStorage.getItem("startup-idea");
    if (!idea) {
      router.replace("/");
      return;
    }

    initializedRef.current = true;
    capture("interview_started", { idea_length: idea.length });

    // Create in-progress session, then start interview
    (async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, status: "in-progress" }),
        });
        const data = await res.json();
        if (data.id) sessionIdRef.current = data.id;
      } catch {
        // Continue without session ID
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: idea,
      };
      setMessages([userMsg]);
      fetchReply([userMsg]);
    })();
  }, [router, fetchReply, capture]);

  function handleSendMessage(text: string) {
    if (outOfCredits) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    fetchReply(updated);
  }

  if (summary) {
    return (
      <div
        className="flex-1 opacity-0"
        style={{ animation: "fadeIn 0.5s ease forwards" }}
      >
        <SummaryView summary={summary} sessionId={sessionIdRef.current} />
      </div>
    );
  }

  const outOfCreditsBanner = outOfCredits ? (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg mb-3 max-w-2xl mx-auto"
      style={{
        background: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      }}
    >
      <p className="text-sm" style={{ color: "#fca5a5" }}>
        You&apos;ve run out of credits. Purchase more to continue your interview.
      </p>
      <button
        onClick={() => window.open("/credits", "_blank")}
        className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, var(--color-accent-dim), var(--color-accent))",
          color: "#ffffff",
        }}
      >
        Buy Credits
      </button>
    </div>
  ) : null;

  return (
    <div className="flex-1 flex flex-col">
      <ProgressBar progress={progress} />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={outOfCredits}
        banner={outOfCreditsBanner}
      />
    </div>
  );
}
