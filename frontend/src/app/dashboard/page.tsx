"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Rating, Review } from "@/lib/types";
import { MovieCard } from "@/components/MovieCard";
import { RatingStars } from "@/components/RatingStars";
import { MovieCardSkeleton } from "@/components/LoadingSkeleton";
import { LayoutDashboard, Heart, Star, History, Settings, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<"ratings" | "favorites" | "history" | "settings">("ratings");

  // Data states
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [submittingSettings, setSubmittingSettings] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const ratingsData = await api.getMyRatings();
      setRatings(ratingsData);

      const favoritesData = await api.getMyFavorites();
      setFavorites(favoritesData);

      const historyData = await api.getMyWatchHistory();
      setHistory(historyData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      setName(user.name);
      setEmail(user.email);
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess("");
    setSettingsError("");

    if (!name || !email) {
      setSettingsError("Name and Email are required.");
      return;
    }
    if (password && password !== confirm) {
      setSettingsError("Passwords do not match.");
      return;
    }

    setSubmittingSettings(true);
    try {
      const data: any = { name, email };
      if (password) data.password = password;
      
      const updated = await api.updateProfile(data);
      updateUser(updated);
      setSettingsSuccess("Profile updated successfully!");
      setPassword("");
      setConfirm("");
    } catch (e: any) {
      setSettingsError(e.message || "Failed to update profile settings.");
    } finally {
      setSubmittingSettings(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "ratings", label: "My Ratings", icon: Star },
    { id: "favorites", label: "Favorites List", icon: Heart },
    { id: "history", label: "Watch History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10 w-full text-left">
      
      {/* Profile Header card */}
      <div className="glass p-6 md:p-8 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-white font-black text-xl uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-white">{user.name}</h1>
            <span className="text-xs text-text-secondary mt-0.5">{user.email}</span>
            <span className="text-[10px] text-text-muted mt-1 font-semibold">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{ratings.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider mt-0.5">Rated</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{favorites.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider mt-0.5">Favorites</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{history.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider mt-0.5">Watched</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4 md:gap-6 no-scrollbar shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-1 select-none ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-white"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        {loading && activeTab !== "settings" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* 1. Ratings Tab */}
            {activeTab === "ratings" && (
              ratings.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ratings.map((rat) => (
                    <div key={rat.id} className="relative group">
                      <MovieCard movie={rat.movie} />
                      <div className="absolute top-2 left-2 z-25 bg-[#070707]/90 backdrop-blur border border-accent/20 px-2 py-1 rounded-md flex items-center gap-1 shadow">
                        <Star size={10} className="fill-accent text-accent" />
                        <span className="text-[9px] font-black text-white">{rat.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-xl py-16 text-center text-xs text-text-secondary font-medium">
                  You haven&apos;t rated any movies yet.
                </div>
              )
            )}

            {/* 2. Favorites Tab */}
            {activeTab === "favorites" && (
              favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {favorites.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-xl py-16 text-center text-xs text-text-secondary font-medium">
                  Your favorites list is currently empty.
                </div>
              )
            )}

            {/* 3. History Tab */}
            {activeTab === "history" && (
              history.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {history.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-xl py-16 text-center text-xs text-text-secondary font-medium">
                  Watch history is currently empty.
                </div>
              )
            )}

            {/* 4. Profile settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md bg-surface border border-white/5 rounded-xl p-6 md:p-8 flex flex-col gap-6"
              >
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Update Profile Details
                </h3>

                {settingsSuccess && (
                  <div className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-3 text-center flex items-center justify-center gap-1.5">
                    <Check size={13} />
                    <span>{settingsSuccess}</span>
                  </div>
                )}
                {settingsError && (
                  <div className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 text-center">
                    {settingsError}
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSettings}
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all shadow cursor-pointer mt-2 flex items-center justify-center gap-1.5"
                  >
                    {submittingSettings ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
