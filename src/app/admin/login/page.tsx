"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn, onAuthChange } from "@/lib/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If already authenticated, redirect
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) router.replace("/admin/products");
    });
    return unsubscribe;
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.replace("/admin/products");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "oklch(0.97 0.006 250)" }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-wider text-nino-950">
            NINO JEANS
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-nino-600 font-[var(--font-display)] mt-1">
            ADMIN DASHBOARD
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.15em] text-nino-800/40 font-[var(--font-display)] font-medium mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-nino-200/40 bg-white text-nino-950 font-[var(--font-body)] text-sm focus:outline-none focus:border-nino-500/50 focus:ring-2 focus:ring-nino-500/10 transition-all"
              placeholder="admin@ninojeans.com"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.15em] text-nino-800/40 font-[var(--font-display)] font-medium mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-nino-200/40 bg-white text-nino-950 font-[var(--font-body)] text-sm focus:outline-none focus:border-nino-500/50 focus:ring-2 focus:ring-nino-500/10 transition-all"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <motion.p
              className="text-red-500 text-sm font-[var(--font-display)] text-center"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-[var(--font-display)] text-sm font-semibold tracking-[0.15em] text-white bg-nino-950 hover:bg-nino-800 disabled:bg-nino-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
