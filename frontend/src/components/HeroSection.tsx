"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/lib/types";
import { Info, Play, Star } from "lucide-react";

interface HeroSectionProps {
  movies: Movie[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 9000); // rotate every 9s
    
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  
  // Backdrops can be loaded from original image sizes or fallback gradients
  const backdropSrc = currentMovie.backdrop_url || currentMovie.poster_url;

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Backdrop Image */}
          {backdropSrc ? (
            <div className="absolute inset-0">
              <Image
                src={backdropSrc}
                alt={currentMovie.title}
                fill
                priority
                className="object-cover object-top opacity-65 brightness-[0.7]"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black" />
          )}

          {/* Gradient overlays to bleed seamlessly into dark theme background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-transparent max-w-2xl" />

          {/* Details Content Container */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-12 max-w-4xl mx-auto md:mx-0 pt-20">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-start text-left gap-4 max-w-lg md:max-w-xl"
            >
              {/* Category tag */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary px-2.5 py-1 rounded text-white shadow-lg">
                  Featured
                </span>
                {currentMovie.release_year && (
                  <span className="text-xs font-semibold text-text-secondary">
                    {currentMovie.release_year}
                  </span>
                )}
                <div className="flex items-center gap-1 text-accent ml-2">
                  <Star size={14} className="fill-accent" />
                  <span className="text-xs font-bold">{currentMovie.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight drop-shadow-md">
                {currentMovie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5">
                {currentMovie.genres.split("|").map((g) => (
                  <span
                    key={g}
                    className="text-xs text-white/80 bg-zinc-850/80 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Overview Description */}
              <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed drop-shadow line-clamp-3">
                {currentMovie.overview}
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 mt-2">
                <Link href={`/movies/${currentMovie.id}`}>
                  <button className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer">
                    <Play size={18} className="fill-white" />
                    <span>Details</span>
                  </button>
                </Link>
                <Link href={`/movies/${currentMovie.id}#reviews`}>
                  <button className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3 bg-zinc-850/85 hover:bg-zinc-800 text-white font-semibold rounded-lg border border-white/10 shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md">
                    <Info size={18} />
                    <span>Reviews</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
