"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PACKS = [
  { id: "pack_10", name: "10 Credits", credits: 10, price: "$1" },
  { id: "pack_50", name: "50 Credits", credits: 50, price: "$5" },
  { id: "pack_200", name: "200 Credits", credits: 200, price: "$15", badge: "25% off" },
];

export default function CreditsPage() {
  return (
    <Suspense>
      <CreditsContent />
    </Suspense>
  );
}

function CreditsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const insufficient = searchParams.get("reason") === "insufficient";

  useEffect(() => {
    fetch("/api/credits")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.balance === "number") setBalance(data.balance);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleBuy(packId: string) {
    setBuying(packId);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setBuying(null);
    }
  }

  const displayBalance =
    balance !== null ? Math.floor(balance * 10) / 10 : null;

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
          Credits
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-[#c4b5fd] hover:border-[rgba(167,139,250,0.3)]"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          Back
        </button>
      </div>

      {success && (
        <div
          className="mb-6 p-4 rounded-xl text-sm"
          style={{
            color: "#4ade80",
            backgroundColor: "rgba(74, 222, 128, 0.08)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
          }}
        >
          Credits added successfully!
        </div>
      )}

      {insufficient && (
        <div
          className="mb-6 p-4 rounded-xl text-sm"
          style={{
            color: "#fbbf24",
            backgroundColor: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
          }}
        >
          You need credits to continue. Purchase a pack below to resume your interview.
        </div>
      )}

      {/* Current balance */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--color-accent)" }}
        >
          Current Balance
        </p>
        <p className="text-4xl font-light">
          {loading ? (
            <span style={{ color: "var(--color-muted)" }}>...</span>
          ) : (
            <>
              <span>{displayBalance}</span>
              <span
                className="text-base ml-2"
                style={{ color: "var(--color-muted)" }}
              >
                credits
              </span>
            </>
          )}
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: "var(--color-muted)" }}
        >
          Credits are based on conversation length. A typical interview costs ~5 credits.
        </p>
      </div>

      {/* Credit packs */}
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-4"
        style={{ color: "var(--color-accent)" }}
      >
        Buy Credits
      </p>
      <div className="grid grid-cols-3 gap-4">
        {PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => handleBuy(pack.id)}
            disabled={buying !== null}
            className="relative rounded-xl p-6 text-left transition-all duration-200 hover:border-[rgba(167,139,250,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--color-border)",
            }}
          >
            {"badge" in pack && pack.badge && (
              <span
                className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(167, 139, 250, 0.15)",
                  color: "var(--color-accent)",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                }}
              >
                {pack.badge}
              </span>
            )}
            <p className="text-2xl font-light mb-1">{pack.credits}</p>
            <p
              className="text-xs mb-3"
              style={{ color: "var(--color-muted)" }}
            >
              credits
            </p>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {buying === pack.id ? "Redirecting..." : pack.price}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
