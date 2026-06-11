"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Recommendation } from "@/lib/types";
import { MovieCard } from "@/components/MovieCard";
import { MovieCardSkeleton } from "@/components/LoadingSkeleton";
import { Sparkles, SlidersHorizontal, Plus, Check, Trash2, Loader2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecommendationsPage() {
  const { user } = useAuth();

  const [personalRecs, setPersonalRecs] = useState<Recommendation[]>([]);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [customRecs, setCustomRecs] = useState<Recommendation[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [genresPool, setGenresPool] = useState<string[]>([]);

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const pool = await api.getGenres();
        setGenresPool(pool);
      } catch (e) {
        console.error(e);
      }
    };
    loadStatic();

    if (user) {
      fetchPersonalRecs();
    }
  }, [user]);

  // Debounced movie lookup search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await api.searchMovies(searchQuery);
        const filtered = results.filter(
          (m: Movie) => !favoriteMovies.some((fav) => fav.id === m.id)
        );
        setSearchResults(filtered);
      } catch (e) {}
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery, favoriteMovies]);

  const fetchPersonalRecs = async () => {
    setPersonalLoading(true);
    try {
      const data = await api.getPersonalizedRecommendations();
      setPersonalRecs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddFavorite = (movie: Movie) => {
    setFavoriteMovies((prev) => [...prev, movie]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveFavorite = (movieId: number) => {
    setFavoriteMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  const handleGetCustomRecs = async () => {
    if (selectedGenres.length === 0 && favoriteMovies.length === 0) return;
    setCustomLoading(true);
    try {
      const favIds = favoriteMovies.map((m) => m.id);
      const data = await api.getCustomRecommendations(favIds, selectedGenres);
      setCustomRecs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCustomLoading(false);
    }
  };

  const genresToDisplay = genresPool.length > 0 ? genresPool : ["Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-12 w-full text-left grad-hero noise">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3">
          <Sparkles className="text-primary fill-primary animate-pulse" size={30} />
          <span className="tracking-tight">AI Movie Recommendation Engine</span>
        </h1>
        <p className="text-xs md:text-sm text-text-secondary max-w-2xl leading-relaxed font-medium">
          Generate precision matching films utilizing our advanced hybrid algorithm combining Collaborative user ratings and content metadata vectors.
        </p>
      </div>

      {/* Primary configuration and results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Filter Settings Card */}
        <div className="lg:col-span-1 glass-card p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col gap-6 h-fit shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-4">
            <SlidersHorizontal size={15} className="text-primary" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest">
              Algorithm Settings
            </h2>
          </div>

          {/* Genre selections */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Preferred Genres
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 select-none">
              {genresToDisplay.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer select-none ${
                      active
                        ? "bg-primary border-primary text-white shadow-md glow-red"
                        : "bg-zinc-950 border-white/5 text-text-secondary hover:text-white hover:border-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite lookup input */}
          <div className="flex flex-col gap-3 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Base on Favorite Movies
            </label>
            <input
              type="text"
              placeholder="Search and add movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base text-xs font-semibold"
            />

            {/* Dropdown suggests */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full mt-2 left-0 right-0 z-30 rounded-xl bg-zinc-950 border border-white/10 shadow-2xl max-h-48 overflow-y-auto flex flex-col p-1 gap-0.5"
                >
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleAddFavorite(m)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{m.title}</span>
                      <Plus size={13} className="text-primary shrink-0" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected items badges */}
            {favoriteMovies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {favoriteMovies.map((m) => (
                  <span
                    key={m.id}
                    className="flex items-center gap-1.5 text-[10px] font-bold bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-white"
                  >
                    <span className="truncate max-w-[120px]">{m.title}</span>
                    <button
                      onClick={() => handleRemoveFavorite(m.id)}
                      className="text-text-secondary hover:text-primary cursor-pointer shrink-0 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGetCustomRecs}
            disabled={selectedGenres.length === 0 && favoriteMovies.length === 0}
            className="btn-primary w-full py-2.5 mt-2 rounded-xl text-xs select-none disabled:opacity-40"
          >
            <span>Run Recommendation Engine</span>
          </button>
        </div>

        {/* Right Side: Output Grid matches */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">
              Generated Matches ({customRecs.length})
            </h2>
          </div>

          {customLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : customRecs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {customRecs.map((rec) => {
                const matchPct = Math.round(rec.score * 100);
                return (
                  <motion.div 
                    key={rec.movie.id} 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <MovieCard movie={rec.movie} />
                    <div className="absolute top-2 left-2 z-20 bg-black/70 backdrop-blur border border-accent/20 px-2 py-0.5 rounded text-[9px] font-black text-accent shadow select-none">
                      Match {matchPct > 100 ? 100 : matchPct < 20 ? 55 : matchPct}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-2xl py-24 text-center flex flex-col items-center justify-center gap-4 p-8">
              <span className="text-5xl animate-pulse">🍿</span>
              <span className="text-xs md:text-sm font-bold text-text-secondary max-w-sm leading-relaxed">
                Configure preferred genres or select movie references on the left, then click run to process matches.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Recommendations Section */}
      {user && (
        <div className="w-full border-t border-white/5 pt-12 flex flex-col gap-6">
          <h2 className="text-base font-black text-white uppercase tracking-widest">
            Personalized For Your Rating History
          </h2>

          {personalLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : personalRecs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {personalRecs.map((rec) => {
                const matchPct = Math.round(rec.score * 100);
                return (
                  <div key={rec.movie.id} className="relative group">
                    <MovieCard movie={rec.movie} />
                    <div className="absolute top-2 left-2 z-20 bg-black/70 backdrop-blur border border-accent/20 px-2.5 py-0.5 rounded text-[9px] font-black text-accent shadow select-none">
                      Match {matchPct > 100 ? 100 : matchPct < 20 ? 65 : matchPct}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-2xl py-14 text-center text-xs text-text-secondary font-bold">
              Rate movies to populate your personal rating profile and compile customized suggestions!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
