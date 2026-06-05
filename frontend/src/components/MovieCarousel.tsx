"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";
import Link from "next/link";

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
      setShowLeftArrow(scrollLeft > 5);
      // Allow slight threshold for right end check
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
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
      // Scroll by 80% of width
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative group/carousel py-4">
      {/* Title block */}
      <div className="flex justify-between items-end px-4 md:px-8 mb-3">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide hover:text-white/80 transition-colors">
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-semibold text-primary hover:text-primary-hover uppercase tracking-wider"
          >
            See All
          </Link>
        )}
      </div>

      {/* Slide Container Wrapper */}
      <div className="relative overflow-visible px-4 md:px-8">
        {/* Left Scroll Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 hover:scale-110 transition-all duration-250 backdrop-blur-md"
            aria-label="Scroll Left"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Scroll Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white cursor-pointer opacity-0 group-hover/carousel:opacity-100 hover:bg-black/90 hover:scale-110 transition-all duration-250 backdrop-blur-md"
            aria-label="Scroll Right"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto overflow-y-visible py-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="min-w-[140px] w-[140px] sm:min-w-[160px] sm:w-[160px] md:min-w-[200px] md:w-[200px] snap-start"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
