"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // e.g. 0 to 5 or 0 to 10
  maxRating?: number; // default is 5
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
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const getStarFill = (index: number) => {
    const currentRating = hoverRating !== null ? hoverRating : rating;
    const starValue = index + 1;
    
    if (currentRating >= starValue) {
      return "fill-accent stroke-accent";
    }
    if (currentRating >= starValue - 0.5) {
      return "fill-accent/50 stroke-accent"; // Simple approximation for half stars
    }
    return "stroke-text-muted fill-transparent opacity-40";
  };

  const handleStarClick = (index: number) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => (
        <button
          key={index}
          type="button"
          disabled={!interactive}
          className={`${starSizes[size]} transition-all ${
            interactive ? "cursor-pointer hover:scale-120" : "cursor-default"
          }`}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <Star className={`${getStarFill(index)} w-full h-full`} />
        </button>
      ))}
    </div>
  );
};
