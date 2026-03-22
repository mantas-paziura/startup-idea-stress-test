"use client";

export default function NeonButton({
  children,
  disabled,
  onClick,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group relative rounded-xl transition-all duration-300 border border-[rgba(168,85,247,0.5)] bg-transparent shadow-[0_0_12px_rgba(139,92,246,0.15)] hover:border-[rgba(168,85,247,0.8)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.08)] ${className}`}
      style={{
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <span
        className="relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold tracking-wide transition-colors duration-300 group-hover:text-white"
        style={{
          color: "#c4b5fd",
        }}
      >
        {children}
      </span>
    </button>
  );
}
