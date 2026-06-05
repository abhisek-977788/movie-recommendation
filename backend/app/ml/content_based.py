import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

class ContentBasedRecommender:
    def __init__(self):
        self.tfidf = None
        self.tfidf_matrix = None
        self.cosine_sim = None
        self.movies_df = None
        self.movie_to_idx = {}
        self.idx_to_movie = {}

    def fit(self, movies_df: pd.DataFrame):
        """
        Fits the TF-IDF model on movie genres + titles.
        """
        self.movies_df = movies_df.copy()
        
        # We replace pipe-separated genres with spaces
        genres_cleaned = self.movies_df['genres'].fillna('').str.replace('|', ' ', regex=False)
        
        # Combine genre text and optionally overview/title if present (e.g. if we seed database detail)
        # For MovieLens csv, we only have title and genres
        self.movies_df['text_features'] = genres_cleaned + " " + self.movies_df['title'].fillna('')
        
        self.tfidf = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.tfidf.fit_transform(self.movies_df['text_features'])
        
        # Compute cosine similarity
        self.cosine_sim = linear_kernel(self.tfidf_matrix, self.tfidf_matrix)
        
        # Create mappings
        self.movie_to_idx = {row['movieId']: i for i, row in self.movies_df.iterrows()}
        self.idx_to_movie = {i: row['movieId'] for i, row in self.movies_df.iterrows()}

    def get_similar_movies(self, movie_id: int, n: int = 10):
        """
        Returns a list of (movieId, score) representing similar movies.
        """
        if movie_id not in self.movie_to_idx:
            return []
            
        idx = self.movie_to_idx[movie_id]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        
        # Sort by similarity score descending
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Exclude the queried movie itself
        sim_scores = [s for s in sim_scores if s[0] != idx]
        
        # Take top n
        top_scores = sim_scores[:n]
        
        return [(self.idx_to_movie[i], score) for i, score in top_scores]

    def get_recommendations_from_profile(self, favorite_genres: list[str], liked_movie_ids: list[int], n: int = 10):
        """
        Generates recommendations based on a user profile.
        """
        if not liked_movie_ids and not favorite_genres:
            return []

        # Build user profile vector
        # If we have liked movies, we average their TF-IDF vectors
        user_vector = None
        
        valid_indices = [self.movie_to_idx[mid] for mid in liked_movie_ids if mid in self.movie_to_idx]
        
        if valid_indices:
            # Average vectors of liked movies
            user_vector = self.tfidf_matrix[valid_indices].mean(axis=0)
        
        # If user has favorite genres, we can add them to the profile vector
        if favorite_genres:
            genre_text = " ".join(favorite_genres)
            genre_vector = self.tfidf.transform([genre_text])
            if user_vector is not None:
                # Combine (weighted)
                user_vector = 0.7 * user_vector + 0.3 * genre_vector
            else:
                user_vector = genre_vector

        if user_vector is None:
            return []

        # Convert user_vector to a dense array or matrix (ensure correct dimensions)
        from scipy.sparse import issparse
        if not issparse(user_vector):
            import numpy as np
            user_vector = np.asarray(user_vector)

        # Compute similarity between user profile and all movies
        sim_scores = linear_kernel(user_vector, self.tfidf_matrix).flatten()
        
        # Get indices sorted by similarity score
        sorted_indices = sim_scores.argsort()[::-1]
        
        # Filter out movies user already liked
        liked_set = set(valid_indices)
        recommended = []
        for idx in sorted_indices:
            if idx not in liked_set:
                recommended.append((int(self.idx_to_movie[idx]), float(sim_scores[idx])))
            if len(recommended) >= n:
                break
                
        return recommended

    def save(self, file_path: str):
        joblib.dump({
            "tfidf": self.tfidf,
            "tfidf_matrix": self.tfidf_matrix,
            "cosine_sim": self.cosine_sim,
            "movies_df": self.movies_df,
            "movie_to_idx": self.movie_to_idx,
            "idx_to_movie": self.idx_to_movie
        }, file_path)

    def load(self, file_path: str):
        data = joblib.load(file_path)
        self.tfidf = data["tfidf"]
        self.tfidf_matrix = data["tfidf_matrix"]
        self.cosine_sim = data["cosine_sim"]
        self.movies_df = data["movies_df"]
        self.movie_to_idx = data["movie_to_idx"]
        self.idx_to_movie = data["idx_to_movie"]
