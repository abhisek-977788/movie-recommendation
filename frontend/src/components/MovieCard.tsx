"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Movie } from "@/lib/types";
import { RatingStars } from "./RatingStars";
import { Play, Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const hasPoster = !!movie.poster_url;

  return (
    <Link href={`/movies/${movie.id}`} className="block">
      <div className="card-hover group relative flex flex-col rounded-xl overflow-hidden cursor-pointer bg-surface border border-white/5 shadow-lg aspect-[2/3]">
        {/* Poster image wrapper */}
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
          {hasPoster ? (
            <Image
              src={movie.poster_url!}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 240px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-[0.4]"
              loading="lazy"
            />
          ) : (
            // Custom placeholder layout
            <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br from-zinc-800 to-zinc-950">
              <span className="text-4xl mb-3">🎬</span>
              <span className="text-xs font-black text-white uppercase tracking-wider line-clamp-2 px-1">
                {movie.title}
              </span>
              <span className="text-[10px] text-text-muted mt-1.5 font-bold uppercase">
                {movie.release_year || "Unknown"}
              </span>
            </div>
          )}

          {/* Premium Hover Overlay details */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10 text-left bg-gradient-to-t from-black via-black/75 to-transparent">
            <div className="flex flex-col gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
              {/* Play icon and year */}
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white shadow-lg glow-red transition-all scale-90 group-hover:scale-100 duration-200">
                  <Play size={14} className="fill-white ml-0.5" />
                </div>
                {movie.release_year && (
                  <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                    {movie.release_year}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xs font-black text-white leading-tight tracking-wide line-clamp-2 mt-1">
                {movie.title}
              </h3>

              {/* Ratings representation */}
              <div className="flex items-center gap-1.5">
                <RatingStars rating={movie.rating / 2} size="sm" />
                <span className="text-[10px] font-extrabold text-accent flex items-center gap-0.5">
                  <span>{(movie.rating).toFixed(1)}</span>
                </span>
              </div>

              {/* Genres tags */}
              <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres.split("|").slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="text-[9px] font-bold text-white/70 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Subtle border glow on card hover */}
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/25 rounded-xl transition-colors pointer-events-none" />
        </div>
      </div>
    </Link>
  );
};
