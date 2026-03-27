"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    const fetchCredits = () => {
      fetch("/api/credits")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.balance === "number") setCredits(data.balance);
        })
        .catch(() => {});
    };

    fetchCredits();
    const interval = setInterval(fetchCredits, 10000);
    return () => clearInterval(interval);
  }, [isSignedIn]);

  if (!isSignedIn) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80"
      >
        <span
          className="text-sm font-semibold tracking-tight"
          style={{
            background: "linear-gradient(135deg, var(--color-accent), var(--color-cyan))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Stress Test
        </span>
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/credits")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-[#c4b5fd] hover:border-[rgba(167,139,250,0.3)] hover:bg-[rgba(167,139,250,0.08)] hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          {credits !== null ? `${Math.floor(credits * 10) / 10} credits` : "Credits"}
        </button>
        <button
          onClick={() => router.push("/history")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-[#c4b5fd] hover:border-[rgba(167,139,250,0.3)] hover:bg-[rgba(167,139,250,0.08)] hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          History
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </header>
  );
}
