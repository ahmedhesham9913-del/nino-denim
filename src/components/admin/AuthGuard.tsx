"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setState("authenticated");
      } else {
        setState("unauthenticated");
        router.replace("/admin/login");
      }
    });
    return unsubscribe;
  }, [router]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.006 250)" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-nino-300/30 border-t-nino-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-nino-800/30 font-[var(--font-display)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (state === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
