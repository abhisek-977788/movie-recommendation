"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Recommendation } from "@/lib/types";
import { HeroSection } from "@/components/HeroSection";
import { MovieCarousel } from "@/components/MovieCarousel";
import { MovieCarouselSkeleton } from "@/components/LoadingSkeleton";

export default function Home() {
  const { user } = useAuth();
  
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [comedy, setComedy] = useState<Movie[]>([]);
  const [sciFi, setSciFi] = useState<Movie[]>([]);
  const [drama, setDrama] = useState<Movie[]>([]);
  const [personalized, setPersonalized] = useState<Movie[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        // Fetch rows
        const trendingData = await api.getTrendingMovies();
        setTrending(trendingData);

        const topRatedData = await api.getTopRatedMovies();
        setTopRated(topRatedData);

        const actionData = await api.getMovies(1, 15, "Action");
        setAction(actionData.movies);

        const comedyData = await api.getMovies(1, 15, "Comedy");
        setComedy(comedyData.movies);

        const sciFiData = await api.getMovies(1, 15, "Sci-Fi");
        setSciFi(sciFiData.movies);

        const dramaData = await api.getMovies(1, 15, "Drama");
        setDrama(dramaData.movies);

      } catch (e) {
        console.error("Failed to fetch home page movies", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchPersonalized = async () => {
      if (!user) {
        setPersonalized([]);
        return;
      }
      try {
        setPersonalizedLoading(true);
        const data = await api.getPersonalizedRecommendations();
        // data returns list of { movie, score }
        const mapped = data.map((r: Recommendation) => r.movie);
        setPersonalized(mapped);
      } catch (e) {
        console.error("Failed to load personalized recommendations", e);
      } finally {
        setPersonalizedLoading(false);
      }
    };

    fetchPersonalized();
  }, [user]);

  return (
    <div className="w-full pb-16 flex flex-col">
      {loading ? (
        // Initial Full Shimmer Page
        <div className="w-full">
          <div className="w-full h-[60vh] shimmer animate-pulse mb-8" />
          <MovieCarouselSkeleton />
          <MovieCarouselSkeleton />
        </div>
      ) : (
        <>
          {/* Main Hero Featured Rotation */}
          <HeroSection movies={trending.slice(0, 5)} />

          {/* Catalog Lists Rows */}
          <div className="flex flex-col gap-6 -mt-16 md:-mt-24 z-10 relative">
            
            {/* Personalized Row */}
            {user && (
              personalizedLoading ? (
                <MovieCarouselSkeleton />
              ) : (
                personalized.length > 0 && (
                  <MovieCarousel
                    title={`Top Recommendations for ${user.name}`}
                    movies={personalized}
                    viewAllHref="/recommendations"
                  />
                )
              )
            )}

            <MovieCarousel title="Trending Now" movies={trending} />
            
            <MovieCarousel title="Highest Rated" movies={topRated} />
            
            <MovieCarousel title="Action & Adventure Blockbusters" movies={action} />
            
            <MovieCarousel title="Sci-Fi & Cyberpunk Legends" movies={sciFi} />
            
            <MovieCarousel title="Side-Splitting Comedies" movies={comedy} />
            
            <MovieCarousel title="Emotional Dramas" movies={drama} />
          </div>
        </>
      )}
    </div>
  );
}
