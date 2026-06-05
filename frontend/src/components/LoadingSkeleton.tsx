import React from "react";

export const TextSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`shimmer rounded-md ${className}`} />
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-2 w-full animate-pulse">
    <div className="aspect-[2/3] w-full rounded-lg shimmer" />
    <TextSkeleton className="h-4 w-3/4 mt-1" />
    <TextSkeleton className="h-3 w-1/2" />
  </div>
);

export const MovieCarouselSkeleton: React.FC = () => (
  <div className="w-full py-4 animate-pulse">
    <TextSkeleton className="h-6 w-48 mb-4 ml-4" />
    <div className="flex gap-4 overflow-hidden px-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="min-w-[150px] md:min-w-[200px] flex-1">
          <MovieCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

export const MovieDetailSkeleton: React.FC = () => (
  <div className="w-full min-h-screen py-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 animate-pulse">
    <div className="w-full md:w-1/3 aspect-[2/3] rounded-xl shimmer" />
    <div className="flex-1 flex flex-col gap-4">
      <TextSkeleton className="h-10 w-2/3" />
      <div className="flex gap-2">
        <TextSkeleton className="h-6 w-16" />
        <TextSkeleton className="h-6 w-16" />
        <TextSkeleton className="h-6 w-20" />
      </div>
      <TextSkeleton className="h-24 w-full mt-4" />
      <TextSkeleton className="h-6 w-1/3 mt-4" />
      <TextSkeleton className="h-12 w-full" />
    </div>
  </div>
);
