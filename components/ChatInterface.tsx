"use client";

import { useRef, useEffect, useState } from "react";
import type { Message } from "@/app/types";
import MessageBubble from "./MessageBubble";

function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-accent)",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
}: {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-8 pb-24">
        <div className="flex flex-col gap-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && <LoadingDots />}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 px-4 py-3 z-10"
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--background)",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 max-w-2xl mx-auto"
          style={{
            background: "var(--color-input-bg)",
            border: `1px solid ${focused ? "rgba(167, 139, 250, 0.25)" : "var(--color-border)"}`,
            boxShadow: focused ? "0 0 16px rgba(139, 92, 246, 0.08)" : "none",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type your answer..."
            disabled={isLoading}
            rows={1}
            className="flex-1 text-base outline-none resize-none bg-transparent disabled:opacity-40 leading-relaxed"
            style={{ color: "var(--foreground)" }}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 shrink-0 disabled:opacity-15 hover:scale-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            style={{
              background: canSend
                ? "linear-gradient(135deg, var(--color-accent-dim), var(--color-accent))"
                : "transparent",
              color: canSend ? "#ffffff" : "var(--color-muted)",
              boxShadow: canSend ? "0 0 12px rgba(139, 92, 246, 0.3)" : "none",
            }}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}
