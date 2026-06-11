"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import Link from "next/link";
import { motion } from "framer-motion";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  viewAllHref?: string;
}

export const MovieCarousel: React.FC<MovieCarouselProps> = ({
  title,
  movies,
  viewAllHref,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [movies]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group/carousel py-6 select-none overflow-visible">
      {/* Title Block */}
      <div className="flex justify-between items-end px-4 md:px-8 mb-4">
        <h2 className="section-title">
          {title}<span>.</span>
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-[10px] font-black text-primary hover:text-primary-hover uppercase tracking-widest transition-colors flex items-center gap-1 group/btn"
          >
            <span>See All</span>
            <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
          </Link>
        )}
      </div>

      {/* Slide Carousel Container */}
      <div className="relative px-4 md:px-8 overflow-visible">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover/carousel:opacity-100 hover:scale-110 transition-all duration-300 shadow-2xl hover:border-primary/50"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover/carousel:opacity-100 hover:scale-110 transition-all duration-300 shadow-2xl hover:border-primary/50"
            aria-label="Scroll Right"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Left/Right Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden md:block" />

        {/* Scrollable container with padding to allow card shadow scale */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto overflow-y-visible py-3 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="min-w-[150px] w-[150px] sm:min-w-[170px] sm:w-[170px] md:min-w-[210px] md:w-[210px] snap-start"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
