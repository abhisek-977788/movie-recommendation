"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Movie, Recommendation } from "@/lib/types";
import { HeroSection } from "@/components/HeroSection";
import { MovieCarousel } from "@/components/MovieCarousel";
import { MovieCarouselSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";

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
        // Fetch movie collections
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
    <div className="w-full pb-20 flex flex-col grad-hero">
      {loading ? (
        // Initial Full Page Shimmer Loader
        <div className="w-full">
          <div className="w-full h-[65vh] shimmer animate-pulse mb-8" />
          <div className="flex flex-col gap-6">
            <MovieCarouselSkeleton />
            <MovieCarouselSkeleton />
          </div>
        </div>
      ) : (
        <>
          {/* Main Cinematic Hero Banner */}
          <HeroSection movies={trending.slice(0, 5)} />

          {/* Carousel rows overlapping the hero backdrop */}
          <div className="flex flex-col gap-8 -mt-16 md:-mt-28 z-10 relative px-4 md:px-0">
            
            {/* User Personalized Recommendations */}
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col gap-8"
            >
              <MovieCarousel title="Action & Adventure Blockbusters" movies={action} />
              <MovieCarousel title="Sci-Fi & Cyberpunk Legends" movies={sciFi} />
              <MovieCarousel title="Side-Splitting Comedies" movies={comedy} />
              <MovieCarousel title="Emotional Dramas" movies={drama} />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
