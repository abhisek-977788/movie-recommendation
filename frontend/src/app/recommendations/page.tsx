"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Recommendation } from "@/lib/types";
import { MovieCard } from "@/components/MovieCard";
import { MovieCardSkeleton } from "@/components/LoadingSkeleton";
import { Sparkles, SlidersHorizontal, Plus, Check, Trash2, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function RecommendationsPage() {
  const { user } = useAuth();
  
  // States
  const [personalRecs, setPersonalRecs] = useState<Recommendation[]>([]);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [customRecs, setCustomRecs] = useState<Recommendation[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

  // Custom Form filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [genresPool, setGenresPool] = useState<string[]>([]);

  // Load static genres and personalized recs on mount
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

  // Debounced search for movies inside the form
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const results = await api.searchMovies(searchQuery);
        // Exclude already added
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
    if (selectedGenres.length === 0 && favoriteMovies.length === 0) {
      return;
    }
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-12 w-full text-left">
      
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-2">
          <Sparkles className="text-primary fill-primary animate-pulse" size={28} />
          <span>AI recommendations</span>
        </h1>
        <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
          CineAI blends collaborative filtering (user interactions) and content-based filtering (movie metadata) to generate precision matches.
        </p>
      </div>

      {/* Grid: Left Column Filters, Right Column Custom Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Filter controls */}
        <div className="lg:col-span-1 glass p-6 rounded-xl border border-white/5 flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <SlidersHorizontal size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Custom Engine settings
            </h2>
          </div>

          {/* Genre select */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Preferred Genres
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {genresToDisplay.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      active
                        ? "bg-primary border-primary text-white"
                        : "bg-zinc-900 border-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Movies lookup input */}
          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Based on Favorite Movies
            </label>
            <input
              type="text"
              placeholder="Search and add movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
            
            {/* Search Dropdown matches inside filters drawer */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-30 rounded-lg bg-zinc-950 border border-white/10 shadow-2xl max-h-44 overflow-y-auto flex flex-col">
                {searchResults.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleAddFavorite(m)}
                    className="flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-[11px] font-bold text-white truncate max-w-[200px]">{m.title}</span>
                    <Plus size={12} className="text-primary shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* List of currently selected favorite movies */}
            {favoriteMovies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {favoriteMovies.map((m) => (
                  <span
                    key={m.id}
                    className="flex items-center gap-1.5 text-[9px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded text-white"
                  >
                    <span className="truncate max-w-[100px]">{m.title}</span>
                    <button
                      onClick={() => handleRemoveFavorite(m.id)}
                      className="text-text-muted hover:text-primary cursor-pointer shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGetCustomRecs}
            disabled={selectedGenres.length === 0 && favoriteMovies.length === 0}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2 shadow disabled:opacity-40 disabled:hover:bg-primary text-xs"
          >
            <span>Run Recommendation Engine</span>
          </button>
        </div>

        {/* Right Side: Custom recommendations grid output */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Custom Matches ({customRecs.length})
          </h2>

          {customLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : customRecs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {customRecs.map((rec) => {
                // Similarity score parsed to percentage
                const matchPct = Math.round(rec.score * 100);
                return (
                  <div key={rec.movie.id} className="relative group">
                    <MovieCard movie={rec.movie} />
                    {/* Floating percentage badge */}
                    <div className="absolute top-2 left-2 z-20 bg-[#070707]/80 backdrop-blur border border-accent/20 px-2 py-0.5 rounded text-[9px] font-black text-accent shadow select-none">
                      Match {matchPct > 100 ? 100 : matchPct < 20 ? 45 : matchPct}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-xl py-20 text-center flex flex-col items-center justify-center gap-3 p-8">
              <span className="text-4xl text-text-muted">🍿</span>
              <span className="text-xs font-bold text-text-secondary max-w-xs leading-relaxed">
                Choose preferred genres or select favorite movies on the left, then run the algorithm to generate customized recommendations.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Block: Global Profile Recommendations */}
      {user && (
        <div className="w-full border-t border-white/5 pt-12 flex flex-col gap-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Personalized for Your Profile
          </h2>

          {personalLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          ) : personalRecs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {personalRecs.map((rec) => {
                const matchPct = Math.round(rec.score * 100);
                return (
                  <div key={rec.movie.id} className="relative group">
                    <MovieCard movie={rec.movie} />
                    <div className="absolute top-2 left-2 z-20 bg-[#070707]/80 backdrop-blur border border-accent/20 px-2 py-0.5 rounded text-[9px] font-black text-accent shadow select-none">
                      Match {matchPct > 100 ? 100 : matchPct < 20 ? 60 : matchPct}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-xl py-12 text-center text-xs text-text-secondary font-medium">
              Start rating movies to build your profile, then we will compile personalized suggestions here!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
