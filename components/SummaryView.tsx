"use client";

import { useState, useEffect, useRef } from "react";
import type { InterviewSummary, Suggestions } from "@/app/types";
import NeonButton from "./NeonButton";

function Section({
  label,
  children,
  delay,
}: {
  label: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <div
      className="opacity-0"
      style={{
        animation: `fadeIn 0.4s ease forwards`,
        animationDelay: `${delay}ms`,
      }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-accent)" }}
      >
        {label}
      </h3>
      {children}
    </div>
  );
}

function summaryToText(summary: InterviewSummary): string {
  let text = "STRESS TEST SUMMARY\n\n";
  text += "STRENGTHS\n";
  summary.strengths.forEach((s) => (text += `- ${s}\n`));
  text += "\nWEAKNESSES\n";
  summary.weaknesses.forEach((w) => (text += `- ${w}\n`));
  text += "\nCRITICAL UNKNOWNS\n";
  summary.criticalUnknowns.forEach((c) => (text += `- ${c}\n`));
  text += `\nMOST IMPORTANT NEXT QUESTION\n${summary.mostImportantNextQuestion}\n`;
  return text;
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

export default function SummaryView({
  summary,
}: {
  summary: InterviewSummary;
}) {
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(summaryToText(summary));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const text = summaryToText(summary);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stress-test-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGetSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions(null);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto w-full px-4 py-20 relative">
      {/* Background glow for summary */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
        }}
      />

      <div
        className="flex items-center justify-between mb-16 opacity-0 relative z-10"
        style={{ animation: "fadeInScale 0.5s ease forwards" }}
      >
        <h2
          className="text-3xl font-light tracking-tight"
          style={{
            background: "linear-gradient(135deg, #e5e5e5 30%, var(--color-accent) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Stress Test Summary
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:border-[rgba(167,139,250,0.3)] hover:text-[#c4b5fd]"
            style={{
              border: "1px solid var(--color-border)",
              color: copied ? "var(--color-accent)" : "var(--color-muted)",
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:border-[rgba(167,139,250,0.3)] hover:text-[#c4b5fd]"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <DownloadIcon />
            Download
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-14 relative z-10">
        <Section label="Strengths" delay={100}>
          <ul className="flex flex-col gap-2.5">
            {summary.strengths.map((s, i) => (
              <li key={i} className="text-base leading-relaxed flex gap-2">
                <span style={{ color: "var(--color-accent)", opacity: 0.5 }}>-</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          {suggestions && (
            <div
              className="mt-4 flex flex-col gap-2 opacity-0"
              style={{ animation: "fadeIn 0.4s ease forwards" }}
            >
              {suggestions.strengths.map((s, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed pl-4"
                  style={{
                    borderLeft: "2px solid var(--color-accent)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {s}
                </p>
              ))}
            </div>
          )}
        </Section>

        <Section label="Weaknesses" delay={200}>
          <ul className="flex flex-col gap-2.5">
            {summary.weaknesses.map((w, i) => (
              <li key={i} className="text-base leading-relaxed flex gap-2">
                <span style={{ color: "var(--color-accent)", opacity: 0.5 }}>-</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          {suggestions && (
            <div
              className="mt-4 flex flex-col gap-2 opacity-0"
              style={{ animation: "fadeIn 0.4s ease forwards" }}
            >
              {suggestions.weaknesses.map((s, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed pl-4"
                  style={{
                    borderLeft: "2px solid var(--color-accent)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {s}
                </p>
              ))}
            </div>
          )}
        </Section>

        <Section label="Critical Unknowns" delay={300}>
          <ul className="flex flex-col gap-2.5">
            {summary.criticalUnknowns.map((c, i) => (
              <li key={i} className="text-base leading-relaxed flex gap-2">
                <span style={{ color: "var(--color-accent)", opacity: 0.5 }}>-</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          {suggestions && (
            <div
              className="mt-4 flex flex-col gap-2 opacity-0"
              style={{ animation: "fadeIn 0.4s ease forwards" }}
            >
              {suggestions.criticalUnknowns.map((s, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed pl-4"
                  style={{
                    borderLeft: "2px solid var(--color-accent)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {s}
                </p>
              ))}
            </div>
          )}
        </Section>

        <Section label="Most Important Next Question" delay={400}>
          <p
            className="text-xl leading-relaxed font-light italic"
            style={{ color: "var(--color-accent)" }}
          >
            &ldquo;{summary.mostImportantNextQuestion}&rdquo;
          </p>
        </Section>
      </div>

      <div
        className="mt-16 flex items-center gap-3 opacity-0"
        style={{ animation: "fadeIn 0.4s ease forwards", animationDelay: "500ms" }}
      >
        {!suggestions && (
          <NeonButton
            onClick={handleGetSuggestions}
            disabled={loadingSuggestions}
            className="min-w-[280px]"
          >
            <SparkleIcon />
            {loadingSuggestions ? "Generating..." : "Get suggestions from AI"}
          </NeonButton>
        )}
      </div>
    </div>
  );
}
