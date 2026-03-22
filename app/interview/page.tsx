"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Message, InterviewSummary, ChatResponse } from "@/app/types";
import ChatInterface from "@/components/ChatInterface";
import SummaryView from "@/components/SummaryView";
import ProgressBar from "@/components/ProgressBar";

async function sendToAPI(messages: Message[]): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error("Failed to get response");
  return res.json();
}

// Estimate progress based on conversation exchanges
// 7 themes = roughly 7-14 exchanges, so we estimate based on assistant message count
function estimateProgress(messages: Message[]): number {
  const assistantMessages = messages.filter((m) => m.role === "assistant").length;
  // Expect roughly 7-10 assistant messages to cover all themes
  const estimated = Math.min(95, (assistantMessages / 8) * 100);
  return Math.round(estimated);
}

export default function InterviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const initializedRef = useRef(false);

  const progress = useMemo(() => {
    if (summary) return 100;
    return estimateProgress(messages);
  }, [messages, summary]);

  const fetchReply = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    try {
      const response = await sendToAPI(allMessages);
      if (response.interviewDone && response.summary) {
        setSummary(response.summary);
      } else {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;

    const idea = sessionStorage.getItem("startup-idea");
    if (!idea) {
      router.replace("/");
      return;
    }

    initializedRef.current = true;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: idea,
    };
    setMessages([userMsg]);
    fetchReply([userMsg]);
  }, [router, fetchReply]);

  function handleSendMessage(text: string) {
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
        <SummaryView summary={summary} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ProgressBar progress={progress} />
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
