"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center py-20 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm glass rounded-xl p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-3xl">🎬</span>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Sign In to CineAI
          </h1>
          <p className="text-[11px] text-text-muted">
            Enjoy personalized movie ratings, custom lists, and AI chat.
          </p>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-secondary uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-primary/25 cursor-pointer mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-[11px] text-text-secondary text-center pt-2 border-t border-white/5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary-hover font-bold transition-all">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
