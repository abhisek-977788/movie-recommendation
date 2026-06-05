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
import { Heart, Send, Calendar, User as UserIcon, Clapperboard, Sparkles } from "lucide-react";
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
      // Fetch details
      const detailData = await api.getMovie(movieId);
      setMovie(detailData);
      setIsFavorite(detailData.is_favorite);
      setUserRating(detailData.user_rating || 0);

      // Fetch similar
      const similarData = await api.getSimilarMovies(movieId);
      setSimilar(similarData.map((r: Recommendation) => r.movie));

      // Fetch reviews
      const reviewsData = await api.getMovieReviews(movieId);
      setReviews(reviewsData);

      // Add to watch history
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
      // Refresh movie detail average rating
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
      <div className="w-full flex-1 flex flex-col items-center justify-center p-8 text-center">
        <span className="text-4xl mb-2">⚠️</span>
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-text-secondary mt-1">
          The requested movie catalogue item could not be retrieved.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 flex flex-col">
      {/* Backdrop Hero Header */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-black">
        {movie.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top opacity-35 brightness-[0.5]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main Info Block */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-44 md:-mt-64 z-15 relative flex flex-col md:flex-row gap-8 items-start w-full">
        {/* Left Side: Poster */}
        <div className="w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-white/10 shrink-0 self-center md:self-auto">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={movie.title}
              width={256}
              height={384}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-gradient-to-br from-zinc-800 to-black flex flex-col items-center justify-center p-4 text-center">
              <span className="text-6xl mb-4">🎬</span>
              <span className="text-sm font-black text-white">{movie.title}</span>
            </div>
          )}
        </div>

        {/* Right Side: Data Details */}
        <div className="flex-1 flex flex-col gap-4 text-left w-full">
          {/* Metadata tag pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            {movie.release_year && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-text-secondary bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                <Calendar size={12} />
                <span>{movie.release_year}</span>
              </span>
            )}
            {movie.director && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-text-secondary bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                <Clapperboard size={12} />
                <span>Dir: {movie.director}</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {movie.title}
          </h1>

          {/* Rating aggregate and Favorites toggle button */}
          <div className="flex flex-wrap items-center gap-4 py-1.5 border-y border-white/5">
            <div className="flex items-center gap-2">
              <RatingStars rating={movie.rating / 2} size="md" />
              <span className="text-sm font-black text-accent">{movie.rating.toFixed(1)} / 10</span>
              <span className="text-[10px] text-text-muted">({movie.popularity.toFixed(0)} votes)</span>
            </div>
            
            {user && (
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isFavorite
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
                }`}
              >
                <Heart size={14} className={isFavorite ? "fill-primary" : ""} />
                <span>{isFavorite ? "Favorited" : "Add to Favorites"}</span>
              </button>
            )}
          </div>

          {/* Genres breakdown */}
          <div className="flex flex-wrap gap-1.5">
            {movie.genres.split("|").map((g) => (
              <span key={g} className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-full shadow">
                {g}
              </span>
            ))}
          </div>

          {/* Overview text */}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Synopsis</h3>
            <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-3xl">
              {movie.overview}
            </p>
          </div>

          {/* Cast members details */}
          {movie.cast_members && (
            <div className="flex flex-col gap-1.5 mt-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Cast</h3>
              <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                {movie.cast_members}
              </p>
            </div>
          )}

          {/* Rate interactively */}
          {user && (
            <div className="flex flex-col gap-2 mt-4 p-4 rounded-xl glass-light border border-white/5 max-w-sm">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary animate-pulse" />
                <span>Your Movie Rating</span>
              </h4>
              <div className="flex items-center gap-3">
                <RatingStars rating={userRating} interactive={true} onRate={handleRate} size="lg" />
                <span className="text-xs font-black text-text-secondary">
                  {userRating > 0 ? `${userRating} Stars` : "Unrated"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Movies shelf */}
      <div className="mt-16 w-full">
        <MovieCarousel title="Similar Movies You Might Like" movies={similar} />
      </div>

      {/* Reviews box */}
      <div id="reviews" className="max-w-6xl mx-auto px-4 md:px-8 mt-12 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Submit Review Column */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Write a Review
          </h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <textarea
                placeholder="Share your thoughts about this movie..."
                value={reviewInput}
                onChange={(e) => setReviewInput(e.target.value)}
                rows={4}
                className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary/50 transition-all font-medium resize-none"
              />
              <button
                type="submit"
                disabled={!reviewInput.trim() || submittingReview}
                className="bg-primary hover:bg-primary-hover text-xs font-bold text-white py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 self-end transition-all shadow cursor-pointer disabled:opacity-40"
              >
                <Send size={12} />
                <span>Submit Review</span>
              </button>
            </form>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-lg p-4 text-center text-xs text-text-secondary font-medium">
              Please sign in to write a review.
            </div>
          )}
        </div>

        {/* Reviews Feed Column */}
        <div className="md:col-span-2 flex flex-col gap-4 text-left">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            User Reviews ({reviews.length})
          </h3>
          
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
              {reviews.map((rev) => {
                const sentimentColors = {
                  positive: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  negative: "bg-rose-500/10 border-rose-500/20 text-rose-500",
                  neutral: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
                };
                const sentimentLabel = rev.sentiment || "neutral";
                const sentimentClass = sentimentColors[sentimentLabel as keyof typeof sentimentColors];

                return (
                  <div key={rev.id} className="glass p-4 rounded-xl border border-white/5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                          {rev.user_name?.charAt(0) || "U"}
                        </div>
                        <span className="text-xs font-bold text-white">
                          {rev.user_name || "Anonymous User"}
                        </span>
                      </div>
                      
                      {/* TextBlob Sentiment Badge */}
                      <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${sentimentClass}`}>
                        {sentimentLabel}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                      {rev.review_text}
                    </p>

                    <span className="text-[9px] text-text-muted font-bold self-end">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/5 rounded-lg py-12 text-center text-xs text-text-secondary font-medium">
              No reviews yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
