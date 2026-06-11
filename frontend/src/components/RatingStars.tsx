"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // Rating value (usually 0 to 5)
  maxRating?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  interactive = false,
  onRate,
  size = "md",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-6 h-6",
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-0.5 select-none">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = currentVal >= starValue;
        const isHalf = !isFilled && currentVal >= starValue - 0.5;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${starSizes[size]} transition-all relative ${
              interactive
                ? "cursor-pointer hover:scale-125 hover:text-accent duration-150"
                : "cursor-default"
            }`}
          >
            {isHalf ? (
              <div className="relative w-full h-full">
                {/* Gray background star */}
                <Star className="w-full h-full stroke-white/20 fill-transparent absolute inset-0" />
                {/* Half Gold star */}
                <div className="w-[50%] h-full overflow-hidden absolute inset-0">
                  <Star className="w-full h-full stroke-accent fill-accent" style={{ maxWidth: "200%" }} />
                </div>
              </div>
            ) : (
              <Star
                className={`w-full h-full transition-colors ${
                  isFilled
                    ? "stroke-accent fill-accent text-accent drop-shadow-[0_0_8px_rgba(245,197,24,0.45)]"
                    : "stroke-white/20 fill-transparent opacity-40"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
