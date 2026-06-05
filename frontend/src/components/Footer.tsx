import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070707] border-t border-white/10 py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Info Column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-primary font-black text-lg tracking-wider">
            <span>🎬</span> CineAI
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed max-w-[200px]">
            Next-gen movie recommendations powered by Machine Learning and AI. Explore, review, and chat with CineAI today.
          </p>
        </div>

        {/* Quick Links Column */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Browse
          </h4>
          <Link href="/" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/recommendations" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Recommendations
          </Link>
          <Link href="/chat" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            AI Chat
          </Link>
        </div>

        {/* Genres Column */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Top Genres
          </h4>
          <Link href="/recommendations?genre=Action" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Action
          </Link>
          <Link href="/recommendations?genre=Sci-Fi" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Sci-Fi
          </Link>
          <Link href="/recommendations?genre=Comedy" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Comedy
          </Link>
          <Link href="/recommendations?genre=Drama" className="text-[11px] text-text-secondary hover:text-primary transition-colors">
            Drama
          </Link>
        </div>

        {/* Legal Column */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Platform Info
          </h4>
          <span className="text-[11px] text-text-secondary">
            Version 1.0.0
          </span>
          <span className="text-[11px] text-text-secondary">
            SQLite Database
          </span>
          <span className="text-[11px] text-text-secondary">
            FastAPI Backend
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-text-muted">
          &copy; {new Date().getFullYear()} CineAI Platform. All rights reserved.
        </span>
        <span className="text-[10px] text-text-muted">
          Powered by TMDB API and GroupLens Dataset.
        </span>
      </div>
    </footer>
  );
};
