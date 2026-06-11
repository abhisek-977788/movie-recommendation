import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-background mt-auto">
      {/* Decorative separator line */}
      <hr className="hr-glow" />

      <div className="max-w-6xl mx-auto py-14 px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand Block */}
        <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xl tracking-wider select-none hover:opacity-95"
          >
            <span>🎬</span>
            <span className="grad-text-red font-black">CineAI</span>
          </Link>
          <p className="text-[11px] text-text-secondary leading-relaxed max-w-[240px] font-medium">
            Discover movie matches powered by state-of-the-art hybrid recommendation systems and conversational AI.
          </p>
        </div>

        {/* Navigation Block */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
            Platform Navigation
          </h4>
          <div className="flex flex-col gap-2.5 text-[11px] font-bold">
            <Link href="/" className="text-text-secondary hover:text-primary transition-colors">
              Home Catalog
            </Link>
            <Link href="/recommendations" className="text-text-secondary hover:text-primary transition-colors">
              AI Recommendation Engine
            </Link>
            <Link href="/chat" className="text-text-secondary hover:text-primary transition-colors">
              Interactive Assistant
            </Link>
          </div>
        </div>

        {/* Genres Block */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
            Top Genres
          </h4>
          <div className="flex flex-col gap-2.5 text-[11px] font-bold">
            <Link href="/recommendations" className="text-text-secondary hover:text-primary transition-colors">
              Action & Adventure
            </Link>
            <Link href="/recommendations" className="text-text-secondary hover:text-primary transition-colors">
              Science Fiction
            </Link>
            <Link href="/recommendations" className="text-text-secondary hover:text-primary transition-colors">
              Comedy Blockbusters
            </Link>
            <Link href="/recommendations" className="text-text-secondary hover:text-primary transition-colors">
              Emotional Dramas
            </Link>
          </div>
        </div>

        {/* System Meta Block */}
        <div className="flex flex-col gap-3.5">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">
            Engine Specs
          </h4>
          <div className="flex flex-col gap-2 text-[11px] text-text-secondary font-semibold">
            <span>FastAPI Backend</span>
            <span>Collaborative Filtering (SVD)</span>
            <span>Content-Based (TF-IDF)</span>
            <span className="text-emerald-500 flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>v1.0.0 Production</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom block */}
      <div className="bg-[#09090c] border-t border-white/[0.03] py-6 px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-text-muted">
          <span>
            &copy; {new Date().getFullYear()} CineAI. All rights reserved.
          </span>
          <span className="flex gap-4">
            <span>Powered by TMDB API</span>
            <span className="hidden sm:inline">•</span>
            <span>MovieLens Dataset ml-latest-small</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
