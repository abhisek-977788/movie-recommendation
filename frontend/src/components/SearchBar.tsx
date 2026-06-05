"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Movie } from "@/lib/types";
import Image from "next/image";

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await api.searchMovies(query);
        setResults(searchResults);
        setIsOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelectMovie = (movieId: number) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/movies/${movieId}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-sm">
      {/* Input container */}
      <div className="relative flex items-center w-full">
        <input
          type="text"
          placeholder="Search movies, genres, actors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="w-full bg-zinc-900 border border-white/10 rounded-full py-1.5 pl-10 pr-9 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
        />
        <div className="absolute left-3.5 text-text-muted pointer-events-none">
          <Search size={14} />
        </div>
        {loading ? (
          <div className="absolute right-3.5 text-text-muted animate-spin">
            <Loader2 size={14} />
          </div>
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3.5 text-text-muted hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Dropdown matches list */}
      {isOpen && (results.length > 0 || query.trim().length >= 2) && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-lg overflow-hidden glass shadow-2xl max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="flex flex-col py-1">
              {results.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie.id)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left w-full border-b border-white/5 last:border-0"
                >
                  <div className="relative w-9 h-12 bg-zinc-800 rounded overflow-hidden shrink-0">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={movie.title}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                        <span className="text-[10px]">🎬</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {movie.title}
                    </span>
                    <span className="text-[10px] text-text-secondary mt-0.5">
                      {movie.release_year ? `${movie.release_year} • ` : ""}
                      {movie.genres.split("|").slice(0, 2).join(", ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-center text-xs text-text-secondary">
              No movies found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
