const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("cineai_token") : null;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => 
    fetchApi("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
    
  register: (name: string, email: string, password: string) => 
    fetchApi("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
    
  getProfile: () => fetchApi("/api/profile"),
  
  updateProfile: (data: any) => 
    fetchApi("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Movies
  getMovies: (page = 1, limit = 20, genre = "", year = "", sortBy = "") => {
    let query = `?page=${page}&limit=${limit}`;
    if (genre) query += `&genre=${encodeURIComponent(genre)}`;
    if (year) query += `&year=${year}`;
    if (sortBy) query += `&sort_by=${sortBy}`;
    return fetchApi(`/api/movies${query}`);
  },
  
  getMovie: (id: number) => fetchApi(`/api/movies/${id}`),
  
  searchMovies: (q: string) => fetchApi(`/api/movies/search?q=${encodeURIComponent(q)}`),
  
  getTrendingMovies: () => fetchApi("/api/movies/trending"),
  
  getTopRatedMovies: () => fetchApi("/api/movies/top-rated"),
  
  getGenres: () => fetchApi("/api/movies/genres"),

  // Ratings & Reviews
  rateMovie: (movie_id: number, rating: number) => 
    fetchApi("/api/rate-movie", {
      method: "POST",
      body: JSON.stringify({ movie_id, rating }),
    }),
    
  getMyRatings: () => fetchApi("/api/ratings/me"),
  
  toggleFavorite: (movieId: number) => 
    fetchApi(`/api/favorites/${movieId}`, {
      method: "POST",
    }),
    
  getMyFavorites: () => fetchApi("/api/favorites/me"),
  
  addToWatchHistory: (movieId: number) => 
    fetchApi(`/api/watch-history/${movieId}`, {
      method: "POST",
    }),
    
  getMyWatchHistory: () => fetchApi("/api/watch-history/me"),
  
  submitReview: (movie_id: number, review_text: string) => 
    fetchApi("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ movie_id, review_text }),
    }),
    
  getMovieReviews: (movieId: number) => fetchApi(`/api/reviews/movie/${movieId}`),

  // Recommendations
  getPersonalizedRecommendations: () => fetchApi("/api/recommendations/me"),
  
  getSimilarMovies: (movieId: number) => fetchApi(`/api/similar-movies/${movieId}`),
  
  getCustomRecommendations: (favoriteMovies: number[], preferredGenres: string[]) => 
    fetchApi("/api/recommendations/custom", {
      method: "POST",
      body: JSON.stringify({
        favorite_movies: favoriteMovies,
        preferred_genres: preferredGenres,
      }),
    }),
    
  getGenreRecommendations: (genre: string) => fetchApi(`/api/recommendations/genre/${encodeURIComponent(genre)}`),

  // Chat
  sendChatMessage: (message: string) => 
    fetchApi("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Admin
  getAnalytics: () => fetchApi("/api/admin/analytics"),
  
  getAdminUsers: () => fetchApi("/api/admin/users"),
  
  deleteUser: (userId: number) => 
    fetchApi(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
    
  addMovie: (data: any) => 
    fetchApi("/api/admin/movies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  updateMovie: (id: number, data: any) => 
    fetchApi(`/api/admin/movies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  deleteMovie: (id: number) => 
    fetchApi(`/api/admin/movies/${id}`, {
      method: "DELETE",
    }),
    
  syncTMDb: (category = "popular") => 
    fetchApi(`/api/movies/tmdb/sync?category=${category}`, {
      method: "POST",
    })
};
