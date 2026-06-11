"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Review, Recommendation } from "@/lib/types";
import { RatingStars } from "@/components/RatingStars";
import { MovieCarousel } from "@/components/MovieCarousel";
import { MovieDetailSkeleton } from "@/components/LoadingSkeleton";
import { Heart, Send, Calendar, User as UserIcon, Clapperboard, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const movieId = parseInt(id as string);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewInput, setReviewInput] = useState("");

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      const detailData = await api.getMovie(movieId);
      setMovie(detailData);
      setIsFavorite(detailData.is_favorite);
      setUserRating(detailData.user_rating || 0);

      const similarData = await api.getSimilarMovies(movieId);
      setSimilar(similarData.map((r: Recommendation) => r.movie));

      const reviewsData = await api.getMovieReviews(movieId);
      setReviews(reviewsData);

      if (user) {
        api.addToWatchHistory(movieId).catch(() => {});
      }
    } catch (e) {
      console.error("Failed to load movie details page data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId, user]);

  const handleRate = async (newRating: number) => {
    if (!user) return;
    try {
      setUserRating(newRating);
      await api.rateMovie(movieId, newRating);
      const updated = await api.getMovie(movieId);
      setMovie(updated);
    } catch (e) {
      console.error("Failed to submit rating", e);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      const resp = await api.toggleFavorite(movieId);
      setIsFavorite(resp.is_favorite);
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewInput.trim() || submittingReview || !user) return;

    setSubmittingReview(true);
    try {
      const newReview = await api.submitReview(movieId, reviewInput);
      setReviews((prev) => [newReview, ...prev]);
      setReviewInput("");
    } catch (e) {
      console.error("Failed to submit review", e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (!movie) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center py-24 px-4 text-center grad-hero">
        <AlertCircle size={40} className="text-primary animate-pulse mb-3" />
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Movie Not Found</h2>
        <p className="text-xs text-text-secondary mt-1 max-w-xs font-semibold">
          We could not fetch this catalog item. It may have been deleted or does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 flex flex-col grad-hero noise">
      {/* Dynamic Blurred Backdrop Poster */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-black select-none">
        {movie.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top opacity-30 brightness-[0.4] saturate-[1.2]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Main Movie Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-44 md:-mt-64 z-10 relative flex flex-col md:flex-row gap-10 items-start w-full">
        {/* Left column: Poster image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl bg-zinc-950 border border-white/10 shrink-0 self-center md:self-auto"
        >
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              width={256}
              height={384}
              priority
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-6xl mb-4">🎬</span>
              <span className="text-sm font-black text-white">{movie.title}</span>
            </div>
          )}
        </motion.div>

        {/* Right column: Details and interactive features */}
        <div className="flex-1 flex flex-col gap-5 text-left w-full">
          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            {movie.release_year && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                <Calendar size={12} className="text-violet-500" />
                <span>{movie.release_year}</span>
              </span>
            )}
            {movie.director && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                <Clapperboard size={12} className="text-primary" />
                <span>Director: {movie.director}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
            {movie.title}
          </h1>

          {/* Ratings row */}
          <div className="flex flex-wrap items-center gap-4 py-2 border-y border-white/5 w-full">
            <div className="flex items-center gap-2.5">
              <RatingStars rating={movie.rating / 2} size="md" />
              <span className="text-sm font-black text-accent">{movie.rating.toFixed(1)} <span className="text-xs text-text-muted">/ 10</span></span>
              {movie.popularity > 0 && (
                <span className="text-[10px] font-bold text-text-muted">({Math.round(movie.popularity)} votes)</span>
              )}
            </div>

            {user && (
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-black uppercase transition-all cursor-pointer ${
                  isFavorite
                    ? "bg-primary/15 border-primary/30 text-primary glow-red"
                    : "bg-white/5 border-white/5 text-text-secondary hover:text-white hover:bg-white/10"
                }`}
              >
                <Heart size={13} className={isFavorite ? "fill-primary text-primary" : ""} />
                <span>{isFavorite ? "Favorited" : "Add to List"}</span>
              </button>
            )}
          </div>

          {/* Genres badges */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.split("|").map((g) => (
              <span key={g} className="genre-tag">
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div className="flex flex-col gap-2.5 mt-2">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Synopsis</h3>
            <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed max-w-3xl">
              {movie.overview}
            </p>
          </div>

          {/* Cast */}
          {movie.cast_members && (
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Cast</h3>
              <p className="text-xs text-text-secondary font-semibold leading-relaxed max-w-2xl">
                {movie.cast_members}
              </p>
            </div>
          )}

          {/* Interactive Rating Component */}
          {user && (
            <div className="flex flex-col gap-2.5 mt-4 p-5 rounded-2xl glass border border-white/5 max-w-sm">
              <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={13} className="text-primary fill-primary animate-pulse" />
                <span>Submit Your Rating</span>
              </h4>
              <div className="flex items-center gap-4">
                <RatingStars rating={userRating} interactive={true} onRate={handleRate} size="lg" />
                <span className="text-xs font-black text-text-secondary">
                  {userRating > 0 ? `${userRating} Stars` : "Not Rated"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar movies carousels */}
      {similar.length > 0 && (
        <div className="mt-16 w-full">
          <MovieCarousel title="Similar Movies You Might Enjoy" movies={similar} />
        </div>
      )}

      {/* Reviews feed section */}
      <div id="reviews" className="max-w-6xl mx-auto px-4 md:px-8 mt-12 w-full grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Write a review column */}
        <div className="md:col-span-1 flex flex-col gap-4 text-left">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
            Write a Review
          </h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <textarea
                placeholder="Share your thoughts about this movie..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                rows={4}
                className="input-base text-xs font-semibold resize-none"
              />
              <button
                type="submit"
                disabled={!reviewInput.trim() || submittingReview}
                className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center justify-center gap-2 self-end select-none disabled:opacity-40"
              >
                <Send size={13} />
                <span>Post Review</span>
              </button>
            </form>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-center text-xs text-text-secondary font-bold">
              Please sign in to write a review.
            </div>
          )}
        </div>

        {/* Reviews list column */}
        <div className="md:col-span-2 flex flex-col gap-4 text-left">
          <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
            User Reviews ({reviews.length})
          </h3>

          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2">
              {reviews.map((rev) => {
                const sentimentColors = {
                  positive: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  negative: "bg-rose-500/10 border-rose-500/20 text-rose-500",
                  neutral: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
                };
                const sentimentLabel = rev.sentiment || "neutral";
                const sentimentClass = sentimentColors[sentimentLabel as keyof typeof sentimentColors];

                return (
                  <div key={rev.id} className="glass p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white uppercase shadow-md">
                          {rev.user_name?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs font-black text-white">
                          {rev.user_name || "Anonymous Moviegoer"}
                        </span>
                      </div>

                      {/* Sentiment tag */}
                      <span className={`text-[9px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${sentimentClass}`}>
                        {sentimentLabel}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                      {rev.review_text}
                    </p>

                    <span className="text-[9px] text-text-muted font-bold self-end uppercase tracking-wider">
                      {new Date(rev.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-xl py-12 text-center text-xs text-text-secondary font-bold">
              No reviews listed yet. Write the first review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
