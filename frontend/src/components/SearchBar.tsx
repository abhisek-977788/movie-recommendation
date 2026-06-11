"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Movie } from "@/lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
    <div ref={dropdownRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative flex items-center w-full group">
        <input
          type="text"
          placeholder="Search catalog, genres..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          className="input-base py-2 pl-10 pr-9 text-xs rounded-full font-semibold bg-[#0d0d12] border-white/5 group-hover:border-white/10 transition-all"
        />
        <div className="absolute left-3.5 text-text-secondary group-hover:text-white pointer-events-none transition-colors">
          <Search size={13} />
        </div>
        
        {loading ? (
          <div className="absolute right-3.5 text-primary animate-spin">
            <Loader2 size={13} />
          </div>
        ) : query ? (
          <button
            onClick={handleClear}
            className="absolute right-3.5 text-text-secondary hover:text-white cursor-pointer transition-colors"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      {/* Suggested Search results Dropdown */}
      <AnimatePresence>
        {isOpen && (results.length > 0 || query.trim().length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full mt-2.5 left-0 right-0 z-50 rounded-xl overflow-hidden glass shadow-2xl max-h-80 overflow-y-auto border border-white/10"
          >
            {results.length > 0 ? (
              <div className="flex flex-col p-1.5 gap-0.5">
                {results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left w-full rounded-lg"
                  >
                    <div className="relative w-8 h-11 bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-white/5">
                      {movie.poster_url ? (
                        <Image
                          src={movie.poster_url}
                          alt={movie.title}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                          <span className="text-[10px]">🎬</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {movie.title}
                      </span>
                      <span className="text-[10px] text-text-secondary font-medium truncate mt-0.5">
                        {movie.release_year ? `${movie.release_year} • ` : ""}
                        {movie.genres.split("|").slice(0, 2).join(", ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-center text-xs font-semibold text-text-secondary bg-[#0d0d12]">
                No matching titles for &quot;{query}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
