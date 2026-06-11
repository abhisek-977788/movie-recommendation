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
import { motion, AnimatePresence } from "framer-motion";

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"ratings" | "favorites" | "history" | "settings">("ratings");

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

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
    { id: "settings", label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10 w-full text-left grad-hero noise">
      
      {/* Profile Header card */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center border border-white/10 text-white font-black text-xl uppercase shadow-md select-none">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black text-white">{user.name}</h1>
            <span className="text-xs text-text-secondary mt-0.5 font-semibold">{user.email}</span>
            <span className="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-wider">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{ratings.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-widest mt-0.5">Rated</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{favorites.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-widest mt-0.5">Favorites</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white">{history.length}</span>
            <span className="text-[9px] uppercase font-bold text-text-muted tracking-widest mt-0.5">Watched</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4 md:gap-6 no-scrollbar shrink-0 select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer whitespace-nowrap px-1 ${
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

      {/* Tab components lists */}
      <div className="w-full">
        {loading && activeTab !== "settings" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Ratings tab contents */}
            {activeTab === "ratings" && (
              <motion.div
                key="ratings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {ratings.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {ratings.map((rat) => (
                      <div key={rat.id} className="relative group">
                        <MovieCard movie={rat.movie} />
                        <div className="absolute top-2 left-2 z-20 bg-black/70 backdrop-blur border border-accent/20 px-2 py-0.5 rounded-md flex items-center gap-1 shadow select-none">
                          <Star size={10} className="fill-accent text-accent" />
                          <span className="text-[9px] font-black text-white">{rat.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl py-16 text-center text-xs text-text-secondary font-bold">
                    You haven&apos;t rated any movies yet. Go rate some in the home catalogue!
                  </div>
                )}
              </motion.div>
            )}

            {/* Favorites tab contents */}
            {activeTab === "favorites" && (
              <motion.div
                key="favorites-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {favorites.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl py-16 text-center text-xs text-text-secondary font-bold">
                    Your favorites list is currently empty. Bookmark movies to show them here!
                  </div>
                )}
              </motion.div>
            )}

            {/* History tab contents */}
            {activeTab === "history" && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {history.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {history.map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl py-16 text-center text-xs text-text-secondary font-bold">
                    Watch history is empty. Your watch timeline is auto-compiled as you open movies.
                  </div>
                )}
              </motion.div>
            )}

            {/* Profile settings contents */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="max-w-md bg-surface border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl"
              >
                <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                  Update Account Settings
                </h3>

                {settingsSuccess && (
                  <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 px-4 text-center flex items-center justify-center gap-2">
                    <Check size={14} />
                    <span>{settingsSuccess}</span>
                  </div>
                )}
                {settingsError && (
                  <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl py-3 px-4 text-center">
                    {settingsError}
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-4.5 text-xs font-semibold text-left">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                      Name Reference
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input-base"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSettings}
                    className="btn-primary w-full py-3 rounded-xl mt-2 flex items-center justify-center gap-2 select-none"
                  >
                    {submittingSettings ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
