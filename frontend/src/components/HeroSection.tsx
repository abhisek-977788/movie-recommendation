"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Movie } from "@/lib/types";
import { Info, Play, Star, Calendar } from "lucide-react";

interface HeroSectionProps {
  movies: Movie[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000); // Rotate every 8s

    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const backdropSrc = currentMovie.backdrop_url || currentMovie.poster_url;

  return (
    <div className="relative w-full h-[75vh] md:h-[85vh] overflow-hidden bg-black noise">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Backdrop Image with dramatic brightness and scaling */}
          {backdropSrc ? (
            <motion.div 
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={backdropSrc}
                alt={currentMovie.title}
                fill
                priority
                className="object-cover object-top opacity-50 brightness-[0.5] saturate-[1.1]"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
          )}

          {/* Cinematic lighting gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/25 to-transparent max-w-4xl" />

          {/* Hero details container */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-12 max-w-5xl mx-auto md:mx-0 pt-20">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col items-start text-left gap-5 max-w-lg md:max-w-2xl"
            >
              {/* Category tag */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary px-3 py-1 rounded-md text-white shadow-lg glow-red select-none">
                  Featured Movie
                </span>
                {currentMovie.release_year && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                    <Calendar size={12} className="text-violet-500" />
                    {currentMovie.release_year}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-black/45 border border-white/5 backdrop-blur px-2.5 py-0.5 rounded-md text-accent select-none">
                  <Star size={13} className="fill-accent text-accent" />
                  <span className="text-xs font-black">{(currentMovie.rating).toFixed(1)}</span>
                </div>
              </div>

              {/* Title with Gradient Text */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-none tracking-tight drop-shadow-2xl">
                {currentMovie.title}
              </h1>

              {/* Genre pill tags */}
              <div className="flex flex-wrap gap-2">
                {currentMovie.genres.split("|").map((g) => (
                  <span key={g} className="genre-tag">
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis overview */}
              <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed drop-shadow line-clamp-3 max-w-xl">
                {currentMovie.overview}
              </p>

              {/* Action trigger buttons */}
              <div className="flex items-center gap-4 mt-2">
                <Link href={`/movies/${currentMovie.id}`}>
                  <button className="btn-primary py-3 px-8 text-xs cursor-pointer select-none">
                    <Play size={16} className="fill-white" />
                    <span>Watch Info</span>
                  </button>
                </Link>
                <Link href={`/movies/${currentMovie.id}#reviews`}>
                  <button className="btn-secondary py-3 px-6 text-xs cursor-pointer select-none">
                    <Info size={16} />
                    <span>Read Reviews</span>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators / Rotator progress bars at bottom-right */}
      <div className="absolute bottom-12 right-4 md:right-12 z-20 flex gap-2 select-none">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              index === currentIndex ? "w-8 bg-primary glow-red" : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
