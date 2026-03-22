"use client";

import { useState, useRef, useEffect } from "react";
import NeonButton from "./NeonButton";

export default function IdeaInput({
  onSubmit,
}: {
  onSubmit: (idea: string) => void;
}) {
  const [idea, setIdea] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = idea.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  const hasText = idea.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-8 items-center">
      <div
        className="relative rounded-xl p-4 w-full transition-all duration-300"
        style={{
          background: "rgba(17, 17, 19, 0.8)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${focused ? "rgba(167, 139, 250, 0.3)" : "rgba(255,255,255,0.06)"}`,
          boxShadow: focused
            ? "0 0 20px rgba(139, 92, 246, 0.1), 0 0 60px rgba(139, 92, 246, 0.05)"
            : "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Describe your startup idea in one or two sentences..."
          rows={3}
          className="w-full text-lg leading-relaxed resize-none outline-none bg-transparent"
          style={{ color: "var(--foreground)" }}
        />
      </div>
      <NeonButton type="submit" disabled={!hasText}>
        Start Stress Test
      </NeonButton>
    </form>
  );
}
