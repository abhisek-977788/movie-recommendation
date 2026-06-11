"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Loader2, Sparkles, User as UserIcon, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to create account. Email may already be in use.");
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
          <span className="text-4xl animate-bounce">🎬</span>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
            Join CineAI
          </h1>
          <p className="text-xs text-text-secondary font-medium">
            Register to build your profile, rate movies, and unlock AI suggestions.
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 text-xs font-semibold text-left">
          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
              Full Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base pl-11"
              />
              <UserIcon size={14} className="absolute left-4 text-text-secondary" />
            </div>
          </div>

          {/* Email input */}
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

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pl-11"
              />
              <Lock size={14} className="absolute left-4 text-text-secondary" />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-base pl-11"
              />
              <Lock size={14} className="absolute left-4 text-text-secondary" />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl mt-3 flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} className="fill-white" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-xs text-text-secondary text-center pt-4 border-t border-white/5 font-semibold">
          Already registered?{" "}
          <Link href="/login" className="text-primary hover:text-primary-hover font-black transition-colors ml-1">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
