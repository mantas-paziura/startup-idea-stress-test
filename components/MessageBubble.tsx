"use client";

import type { Message } from "@/app/types";

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: "fadeIn 0.3s ease forwards" }}
    >
      <div
        className="max-w-[80%] px-4 py-3"
        style={
          isUser
            ? {
                background: "var(--color-bubble-user)",
                border: "1px solid var(--color-bubble-user-border)",
                borderRadius: "1rem 1rem 0.25rem 1rem",
              }
            : {
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem 1rem 1rem 0.25rem",
              }
        }
      >
        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
