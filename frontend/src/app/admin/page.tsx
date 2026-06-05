"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { User, Movie } from "@/lib/types";
import { Shield, Users, Clapperboard, Star, MessageSquare, RefreshCw, Trash2, Plus, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Navigation tab states
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "users" | "movies" | "sync">("analytics");

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Users states
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Sync states
  const [syncCategory, setSyncCategory] = useState("popular");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  // Add Movie manual form states
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
      loadAnalytics(); // Refresh totals
    } catch (e: any) {
      setSyncStatus(`Sync error: ${e.message || "Failed to call TMDB."}`);
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
      loadAnalytics(); // Refresh totals
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

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8 w-full text-left">
      
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <Shield size={20} className="fill-primary/20" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
            Admin Management Console
          </h1>
          <span className="text-[10px] text-text-secondary mt-0.5">
            Synchronize catalogs, delete users, and review analytics.
          </span>
        </div>
      </div>

      {/* Sub tabs list */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-4 md:gap-6 no-scrollbar shrink-0 text-xs font-bold">
        {[
          { id: "analytics", label: "Analytics Overview", icon: Shield },
          { id: "users", label: "User Management", icon: Users },
          { id: "movies", label: "Add Movie", icon: Plus },
          { id: "sync", label: "TMDB Data Sync", icon: RefreshCw },
        ].map((tab) => {
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 cursor-pointer whitespace-nowrap px-1 select-none border-b-2 ${
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

      {/* Sub Tab Contents */}
      <div className="w-full">
        
        {/* 1. Analytics Tab */}
        {activeSubTab === "analytics" && (
          analyticsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : analytics ? (
            <div className="flex flex-col gap-8">
              {/* Aggregation statistics row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", count: analytics.total_users, icon: Users, color: "text-blue-500" },
                  { label: "Movies Count", count: analytics.total_movies, icon: Clapperboard, color: "text-emerald-500" },
                  { label: "Movie Ratings", count: analytics.total_ratings, icon: Star, color: "text-amber-500" },
                  { label: "User Reviews", count: analytics.total_reviews, icon: MessageSquare, color: "text-purple-500" },
                ].map((card, i) => (
                  <div key={i} className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{card.label}</span>
                      <span className="text-2xl font-black text-white">{card.count}</span>
                    </div>
                    <card.icon className={`${card.color} opacity-75`} size={24} />
                  </div>
                ))}
              </div>

              {/* Genre Distribution Charts and Recent activity log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Genres charts */}
                <div className="glass p-6 rounded-xl border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Genre Distribution
                  </h3>
                  <div className="flex flex-col gap-3">
                    {Object.entries(analytics.popular_genres)
                      .sort((a: any, b: any) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([genre, count]: any) => {
                        const pct = analytics.total_movies > 0 ? (count / analytics.total_movies) * 100 : 0;
                        return (
                          <div key={genre} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                              <span>{genre}</span>
                              <span>{count} movies ({Math.round(pct)}%)</span>
                            </div>
                            <div className="w-full h-2 rounded bg-zinc-900 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Recent Activity Log */}
                <div className="glass p-6 rounded-xl border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent System Activity
                  </h3>
                  <div className="flex flex-col gap-3.5 max-h-72 overflow-y-auto">
                    {analytics.recent_activity.map((act: any, i: number) => (
                      <div key={i} className="flex flex-col gap-1 text-[11px] border-b border-white/5 pb-2 last:border-0">
                        <div className="flex justify-between font-bold text-white">
                          <span>{act.user_name}</span>
                          <span className="text-[9px] text-text-muted">{act.timestamp}</span>
                        </div>
                        <span className="text-text-secondary font-medium">{act.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null
        )}

        {/* 2. User Management Tab */}
        {activeSubTab === "users" && (
          usersLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="glass rounded-xl border border-white/5 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-white/5 text-[10px] uppercase font-bold text-text-secondary">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Email Address</th>
                    <th className="px-5 py-3">Account Type</th>
                    <th className="px-5 py-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                      <td className="px-5 py-3 flex items-center gap-3 font-semibold text-white">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase">
                          {usr.name.charAt(0)}
                        </div>
                        <span>{usr.name}</span>
                      </td>
                      <td className="px-5 py-3 text-text-secondary font-medium">
                        {usr.email}
                      </td>
                      <td className="px-5 py-3 font-bold">
                        {usr.is_admin ? (
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] bg-zinc-800 text-text-secondary border border-white/5 px-2 py-0.5 rounded">
                            Member
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          disabled={usr.id === user.id}
                          className="text-text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* 3. Add Movie manual form Tab */}
        {activeSubTab === "movies" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl bg-surface border border-white/5 rounded-xl p-6 md:p-8 flex flex-col gap-6"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Add Movie Manually
            </h3>

            {addMovieSuccess && (
              <div className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-3 text-center flex items-center justify-center gap-1.5">
                <Check size={13} />
                <span>{addMovieSuccess}</span>
              </div>
            )}
            {addMovieError && (
              <div className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 px-3 text-center">
                {addMovieError}
              </div>
            )}

            <form onSubmit={handleAddMovie} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Inception"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Genres * (split with |)</label>
                <input
                  type="text"
                  placeholder="e.g. Action|Sci-Fi|Thriller"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Synopsis *</label>
                <textarea
                  placeholder="Movie plot description..."
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  rows={4}
                  className="bg-zinc-900 border border-white/5 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Release Year</label>
                <input
                  type="number"
                  placeholder="e.g. 2010"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Director</label>
                <input
                  type="text"
                  placeholder="e.g. Christopher Nolan"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Cast Members (split with comma)</label>
                <input
                  type="text"
                  placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt"
                  value={castMembers}
                  onChange={(e) => setCastMembers(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">Poster Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={addingMovie}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all shadow cursor-pointer mt-2 md:col-span-2 flex items-center justify-center gap-1.5"
              >
                {addingMovie ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Movie to Catalogue</span>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* 4. TMDB sync trigger Tab */}
        {activeSubTab === "sync" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md bg-surface border border-white/5 rounded-xl p-6 md:p-8 flex flex-col gap-6"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sync Movies with TMDB
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Pull metadata, credits, popular scores, and backdrop URLs from TMDB API to cache them inside your local database. Requires a valid `TMDB_API_KEY` configured in `.env`.
            </p>

            {syncStatus && (
              <div className="text-[11px] font-semibold text-white bg-zinc-800 border border-white/10 rounded-lg py-2 px-3 text-center">
                {syncStatus}
              </div>
            )}

            <div className="flex flex-col gap-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                  Sync Category Selection
                </label>
                <select
                  value={syncCategory}
                  onChange={(e) => setSyncCategory(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                >
                  <option value="popular">Popular Movies</option>
                  <option value="top_rated">Top Rated Movies</option>
                  <option value="trending">Trending (Week)</option>
                </select>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-lg transition-all shadow cursor-pointer mt-2 flex items-center justify-center gap-1.5"
              >
                {syncing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Syncing from TMDB...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} />
                    <span>Trigger Sync</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
