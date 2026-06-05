export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Movie {
  id: number;
  title: string;
  genres: string;
  overview: string;
  director: string | null;
  cast_members: string | null;
  release_year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  rating: number;
  popularity: number;
  tmdb_id: number | null;
}

export interface Rating {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  created_at: string;
  movie: Movie;
}

export interface Review {
  id: number;
  user_id: number;
  movie_id: number;
  review_text: string;
  sentiment: string | null;
  polarity: number | null;
  created_at: string;
  user_name?: string;
}

export interface Recommendation {
  movie: Movie;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
