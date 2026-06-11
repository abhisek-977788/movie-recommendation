import React from "react";

export const TextSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`shimmer rounded-md ${className}`} />
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3.5 w-full">
    {/* Card poster skeleton */}
    <div className="aspect-[2/3] w-full rounded-xl shimmer border border-white/5" />
    <div className="flex flex-col gap-1.5 px-1">
      <TextSkeleton className="h-4 w-5/6" />
      <TextSkeleton className="h-3.5 w-2/5" />
    </div>
  </div>
);

export const MovieCarouselSkeleton: React.FC = () => (
  <div className="w-full py-6 flex flex-col gap-4">
    <div className="px-4 md:px-8">
      <TextSkeleton className="h-6 w-52" />
    </div>
    <div className="flex gap-4 overflow-hidden px-4 md:px-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="min-w-[150px] w-[150px] sm:min-w-[170px] sm:w-[170px] md:min-w-[210px] md:w-[210px] flex-1">
          <MovieCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

export const MovieDetailSkeleton: React.FC = () => (
  <div className="w-full min-h-screen py-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-start">
    {/* Poster Skeleton */}
    <div className="w-48 md:w-64 aspect-[2/3] rounded-xl shimmer border border-white/10 shrink-0 self-center md:self-auto" />
    {/* Content Skeleton */}
    <div className="flex-1 flex flex-col gap-5 w-full">
      <div className="flex gap-2.5">
        <TextSkeleton className="h-6 w-20" />
        <TextSkeleton className="h-6 w-28" />
      </div>
      <TextSkeleton className="h-12 w-3/4 mt-1" />
      <div className="flex items-center gap-3.5 py-3 border-y border-white/5 w-full">
        <TextSkeleton className="h-6 w-32" />
        <TextSkeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col gap-2.5 mt-2">
        <TextSkeleton className="h-4 w-full" />
        <TextSkeleton className="h-4 w-11/12" />
        <TextSkeleton className="h-4 w-4/5" />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <TextSkeleton className="h-6 w-20" />
        <TextSkeleton className="h-10 w-full max-w-md" />
      </div>
    </div>
  </div>
);
