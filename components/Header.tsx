"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (!isSignedIn) return null;

  return (
    <header
      className="fixed top-0 right-0 z-50 flex items-center gap-3 p-4"
    >
      <button
        onClick={() => router.push("/history")}
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-[#c4b5fd]"
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
    </header>
  );
}
