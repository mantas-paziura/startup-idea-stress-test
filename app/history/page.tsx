"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/app/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-20">
      <div className="flex items-center justify-between mb-12">
        <h1
          className="text-3xl font-light tracking-tight"
          style={{
            background: "linear-gradient(135deg, #e5e5e5 30%, var(--color-accent) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Past Stress Tests
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-[#c4b5fd] hover:border-[rgba(167,139,250,0.3)]"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          New Test
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading...</p>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p style={{ color: "var(--color-muted)" }}>
            No stress tests yet. Run your first one!
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              color: "var(--color-accent)",
              border: "1px solid rgba(167, 139, 250, 0.3)",
            }}
          >
            Start a Stress Test
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session, i) => (
            <button
              key={session.id}
              onClick={() =>
                setExpanded(expanded === session.id ? null : session.id)
              }
              className="text-left w-full rounded-xl p-5 transition-all duration-200 opacity-0"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  expanded === session.id
                    ? "rgba(167, 139, 250, 0.25)"
                    : "var(--color-border)"
                }`,
                animation: `fadeIn 0.3s ease forwards`,
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-relaxed">
                    {truncate(session.idea, 120)}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {formatDate(session.createdAt)}
                    </p>
                    {session.status === "in-progress" && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          color: "#fbbf24",
                          backgroundColor: "rgba(251, 191, 36, 0.1)",
                          border: "1px solid rgba(251, 191, 36, 0.2)",
                        }}
                      >
                        In progress
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs shrink-0 mt-0.5 transition-transform duration-200"
                  style={{
                    color: "var(--color-muted)",
                    transform:
                      expanded === session.id
                        ? "rotate(90deg)"
                        : "rotate(0deg)",
                  }}
                >
                  ›
                </span>
              </div>

              {expanded === session.id && (
                <div
                  className="mt-4 pt-4 flex flex-col gap-4 opacity-0"
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    animation: "fadeIn 0.3s ease forwards",
                  }}
                >
                  {session.summary ? (
                    <>
                      <SummarySection
                        label="Strengths"
                        items={session.summary.strengths}
                      />
                      <SummarySection
                        label="Weaknesses"
                        items={session.summary.weaknesses}
                      />
                      <SummarySection
                        label="Critical Unknowns"
                        items={session.summary.criticalUnknowns}
                      />
                      <div>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                          style={{ color: "var(--color-accent)" }}
                        >
                          Next Question
                        </p>
                        <p
                          className="text-sm italic"
                          style={{ color: "var(--color-accent)", opacity: 0.8 }}
                        >
                          &ldquo;{session.summary.mostImportantNextQuestion}&rdquo;
                        </p>
                      </div>
                    </>
                  ) : (
                    <p
                      className="text-sm italic"
                      style={{ color: "var(--color-muted)" }}
                    >
                      Interview was not completed.
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummarySection({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: "var(--color-accent)" }}
      >
        {label}
      </p>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm leading-relaxed flex gap-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span style={{ color: "var(--color-accent)", opacity: 0.4 }}>
              -
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
