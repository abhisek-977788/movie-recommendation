"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { User, Movie } from "@/lib/types";
import { Shield, Users, Clapperboard, Star, MessageSquare, RefreshCw, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "users" | "movies" | "sync">("analytics");

  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [syncCategory, setSyncCategory] = useState("popular");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState("");
  const [overview, setOverview] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [director, setDirector] = useState("");
  const [castMembers, setCastMembers] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [addMovieSuccess, setAddMovieSuccess] = useState("");
  const [addMovieError, setAddMovieError] = useState("");
  const [addingMovie, setAddingMovie] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (!user.is_admin) {
        router.push("/");
        return;
      }
      loadAnalytics();
    }
  }, [user, authLoading]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsersList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "users") {
      loadUsers();
    }
  }, [activeSubTab]);

  const handleDeleteUser = async (targetId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(targetId);
      setUsersList((prev) => prev.filter((u) => u.id !== targetId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("");
    try {
      const resp = await api.syncTMDb(syncCategory);
      setSyncStatus(`Successfully synced ${resp.synced_count} movies!`);
      loadAnalytics(); // Refresh stats
    } catch (e: any) {
      setSyncStatus(`Sync error: ${e.message || "Failed to sync catalog."}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMovieSuccess("");
    setAddMovieError("");

    if (!title || !genres || !overview) {
      setAddMovieError("Title, Genres, and Synopsis are required.");
      return;
    }

    setAddingMovie(true);
    try {
      const payload = {
        title,
        genres,
        overview,
        release_year: releaseYear ? parseInt(releaseYear) : null,
        director: director || null,
        cast_members: castMembers || null,
        poster_url: posterUrl || null,
        rating: 0.0,
        popularity: 1.0,
      };

      await api.addMovie(payload);
      setAddMovieSuccess(`Movie "${title}" added successfully!`);
      setTitle("");
      setGenres("");
      setOverview("");
      setReleaseYear("");
      setDirector("");
      setCastMembers("");
      setPosterUrl("");
      loadAnalytics(); // Refresh stats
    } catch (e: any) {
      setAddMovieError(e.message || "Failed to add movie.");
    } finally {
      setAddingMovie(false);
    }
  };

  if (authLoading || !user || !user.is_admin) {
    return (
      <div className="w-full flex-1 flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const subtabs = [
    { id: "analytics", label: "Analytics Overview", icon: Shield },
    { id: "users", label: "User Management", icon: Users },
    { id: "movies", label: "Add Movie", icon: Plus },
    { id: "sync", label: "TMDB Data Sync", icon: RefreshCw },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8 w-full text-left grad-hero noise">
      
      {/* Header title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-md">
          <Shield size={20} className="fill-primary/20" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
            Admin Management Console
          </h1>
          <span className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-widest">
            Synchronize catalogs, moderate user entries, and review platform activities.
          </span>
        </div>
      </div>

      {/* Subnavigation menu */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4 md:gap-6 no-scrollbar shrink-0 text-xs font-black uppercase tracking-wider select-none">
        {subtabs.map((tab) => {
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3.5 cursor-pointer whitespace-nowrap px-1 border-b-2 ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-white"
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab content panels */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          
          {/* 1. Analytics view */}
          {activeSubTab === "analytics" && (
            <motion.div
              key="analytics-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-8"
            >
              {analyticsLoading ? (
                <div className="flex justify-center py-14">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : analytics ? (
                <>
                  {/* Aggregation statistics row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", count: analytics.total_users, icon: Users, color: "text-blue-500", border: "border-blue-500/10" },
                      { label: "Movies Count", count: analytics.total_movies, icon: Clapperboard, color: "text-emerald-500", border: "border-emerald-500/10" },
                      { label: "Movie Ratings", count: analytics.total_ratings, icon: Star, color: "text-amber-500", border: "border-amber-500/10" },
                      { label: "User Reviews", count: analytics.total_reviews, icon: MessageSquare, color: "text-purple-500", border: "border-purple-500/10" },
                    ].map((card, i) => (
                      <div key={i} className={`glass p-5 rounded-xl border ${card.border} flex items-center justify-between shadow-md`}>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-black tracking-widest text-text-secondary">{card.label}</span>
                          <span className="text-2xl font-black text-white">{card.count}</span>
                        </div>
                        <card.icon className={`${card.color} opacity-80`} size={22} />
                      </div>
                    ))}
                  </div>

                  {/* Genre distribution progress bars & activities log */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Genre distribution bar graph */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col gap-5 shadow-xl text-left">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                        Genre Distribution
                      </h3>
                      <div className="flex flex-col gap-4">
                        {Object.entries(analytics.popular_genres)
                          .sort((a: any, b: any) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([genre, count]: any) => {
                            const pct = analytics.total_movies > 0 ? (count / analytics.total_movies) * 100 : 0;
                            return (
                              <div key={genre} className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[10px] font-black tracking-wider text-text-secondary uppercase">
                                  <span>{genre}</span>
                                  <span>{count} movies ({Math.round(pct)}%)</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-white/5">
                                  <div className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Recent activities log */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col gap-5 shadow-xl text-left">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                        Platform System Activity
                      </h3>
                      <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto pr-1">
                        {analytics.recent_activity.map((act: any, i: number) => (
                          <div key={i} className="flex flex-col gap-1 text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0 font-medium">
                            <div className="flex justify-between font-bold text-white">
                              <span className="truncate max-w-[200px]">{act.user_name}</span>
                              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{act.timestamp}</span>
                            </div>
                            <span className="text-text-secondary">{act.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </motion.div>
          )}

          {/* 2. User management view */}
          {activeSubTab === "users" && (
            <motion.div
              key="users-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl"
            >
              {usersLoading ? (
                <div className="flex justify-center py-14">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-text-secondary">
                        <th className="px-6 py-4">Name Reference</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4">Account Privilege</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3 font-semibold text-white">
                            <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black uppercase">
                              {usr.name.charAt(0)}
                            </div>
                            <span>{usr.name}</span>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-semibold">
                            {usr.email}
                          </td>
                          <td className="px-6 py-4">
                            {usr.is_admin ? (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                                Admin
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-text-secondary border border-white/5 px-2 py-0.5 rounded">
                                Member
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              disabled={usr.id === user.id}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* 3. Add movie manually view */}
          {activeSubTab === "movies" && (
            <motion.div
              key="movies-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-2xl bg-surface border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                Create Catalog Entry
              </h3>

              {addMovieSuccess && (
                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 px-4 text-center flex items-center justify-center gap-1.5 shadow">
                  <Check size={14} />
                  <span>{addMovieSuccess}</span>
                </div>
              )}
              {addMovieError && (
                <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl py-3 px-4 text-center shadow">
                  {addMovieError}
                </div>
              )}

              <form onSubmit={handleAddMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4.5 text-xs font-semibold text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Title Reference *</label>
                  <input
                    type="text"
                    placeholder="e.g. Inception"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Genres * (split with |)</label>
                  <input
                    type="text"
                    placeholder="e.g. Action|Sci-Fi|Thriller"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Synopsis *</label>
                  <textarea
                    placeholder="Movie plot overview description..."
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    rows={4}
                    className="input-base resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Release Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2010"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Director</label>
                  <input
                    type="text"
                    placeholder="e.g. Christopher Nolan"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Cast (split with comma)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt"
                    value={castMembers}
                    onChange={(e) => setCastMembers(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">Poster image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="input-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingMovie}
                  className="btn-primary w-full py-3 rounded-xl mt-2 md:col-span-2 flex items-center justify-center gap-2 select-none"
                >
                  {addingMovie ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Creating Entry...</span>
                    </>
                  ) : (
                    <span>Add Movie to Catalog</span>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* 4. TMDB synchronization trigger */}
          {activeSubTab === "sync" && (
            <motion.div
              key="sync-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-md bg-surface border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl"
            >
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                Sync Movies with TMDB
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                Pull trending metadata lists, directors/credits, and poster image URLs dynamically from TMDB API to cache inside our local SQLite instance. Requires a valid TMDB key configurations.
              </p>

              {syncStatus && (
                <div className="text-xs font-bold text-white bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-center">
                  {syncStatus}
                </div>
              )}

              <div className="flex flex-col gap-4.5 text-xs font-semibold text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-text-secondary uppercase tracking-widest font-black">
                    TMDB List Category
                  </label>
                  <select
                    value={syncCategory}
                    onChange={(e) => setSyncCategory(e.target.value)}
                    className="input-base py-3 px-3 bg-zinc-950 border border-white/5 text-white"
                  >
                    <option value="popular">Popular Movies</option>
                    <option value="top_rated">Top Rated Movies</option>
                    <option value="trending">Trending Movies (Weekly)</option>
                  </select>
                </div>

                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-primary w-full py-3 rounded-xl mt-2 flex items-center justify-center gap-2 select-none"
                >
                  {syncing ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Syncing Catalog Database...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      <span>Trigger Sync Engine</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
