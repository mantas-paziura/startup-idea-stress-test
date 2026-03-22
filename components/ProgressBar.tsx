"use client";

export default function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-2xl mx-auto">
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ background: "var(--color-progress-bg)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${clamped}%`,
              background: "linear-gradient(90deg, var(--color-accent-dim), var(--color-accent))",
              boxShadow: "0 0 8px rgba(139, 92, 246, 0.4)",
              animation: clamped < 100 ? "progressPulse 2s ease-in-out infinite" : "none",
              opacity: clamped >= 100 ? 1 : undefined,
            }}
          />
        </div>
        <span
          className="text-xs font-medium ml-3 tabular-nums w-8 text-right"
          style={{ color: "var(--color-accent)" }}
        >
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  );
}
