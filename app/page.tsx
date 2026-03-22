"use client";

import { useRouter } from "next/navigation";
import IdeaInput from "@/components/IdeaInput";

export default function Home() {
  const router = useRouter();

  function handleSubmit(idea: string) {
    sessionStorage.setItem("startup-idea", idea);
    router.push("/interview");
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Bokeh city lights background */}
      <div className="bokeh-bg" />

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(9,9,11,0.7) 100%)",
        }}
      />

      <div className="flex flex-col items-center gap-5 mb-16 relative z-10">
        <h1
          className="text-6xl md:text-7xl font-light tracking-tight text-center leading-[1.1]"
          style={{
            background: "linear-gradient(135deg, #f5f5f5 0%, #a78bfa 40%, #22d3ee 60%, #f5f5f5 100%)",
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 8s linear infinite",
          }}
        >
          What are you
          <br />
          thinking about?
        </h1>
        <p className="text-lg mt-2 max-w-md text-center" style={{ color: "var(--color-text-secondary)" }}>
          Describe your idea. Get grilled. Leave sharper.
        </p>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <IdeaInput onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
