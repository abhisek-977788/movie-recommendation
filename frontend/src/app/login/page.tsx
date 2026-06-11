"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Loader2, Sparkles, Mail, Lock } from "lucide-react";
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
    <div className="w-full flex-1 flex items-center justify-center py-20 px-4 grad-hero noise relative">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md glass-card rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col gap-8 border border-white/10"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-4xl animate-bounce">🍿</span>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
            Welcome Back
          </h1>
          <p className="text-xs text-text-secondary font-medium">
            Sign in to access personalized recommendations and AI assistant.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl py-3 px-4 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold text-left">
          {/* Email input field */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
              Email Address
            </label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base pl-11"
              />
              <Mail size={14} className="absolute left-4 text-text-secondary" />
            </div>
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pl-11"
              />
              <Lock size={14} className="absolute left-4 text-text-secondary" />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl mt-3 flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="fill-white" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer options */}
        <div className="text-xs text-text-secondary text-center pt-4 border-t border-white/5 font-semibold">
          New to CineAI?{" "}
          <Link href="/register" className="text-primary hover:text-primary-hover font-black transition-colors ml-1">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
