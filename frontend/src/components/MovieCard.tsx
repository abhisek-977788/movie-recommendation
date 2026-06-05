"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Movie } from "@/lib/types";
import { RatingStars } from "./RatingStars";
import { Play } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Check if poster_url is a TMDB path or full url.
  // Our seed script stores full https URLs, so it's ready.
  const hasPoster = !!movie.poster_url;

  return (
    <Link href={`/movies/${movie.id}`}>
      <motion.div
        className="group relative flex flex-col gap-2 rounded-lg overflow-hidden cursor-pointer bg-surface border border-white/5"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
          {hasPoster ? (
            <Image
              src={movie.poster_url!}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 150px, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            // Placeholder gradient with title initials
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-zinc-800 to-zinc-950">
              <span className="text-4xl mb-2">🎬</span>
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider line-clamp-2">
                {movie.title}
              </span>
              <span className="text-[10px] text-text-muted mt-1">
                {movie.release_year || "N/A"}
              </span>
            </div>
          )}

          {/* Interactive Netflix-style Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4 text-left">
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white transition-colors">
                  <Play size={14} className="fill-white ml-0.5" />
                </div>
                <span className="text-xs font-bold text-white bg-zinc-800/80 px-2 py-0.5 rounded">
                  {movie.release_year}
                </span>
              </div>
              
              <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">
                {movie.title}
              </h3>
              
              <div className="flex items-center gap-1">
                {/* Seed average rating is usually out of 10. We map it to 5 stars */}
                <RatingStars rating={movie.rating / 2} size="sm" />
                <span className="text-[10px] font-bold text-accent">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres.split("|").slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[9px] font-medium text-white/70 bg-white/10 px-1.5 py-0.5 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
