import joblib
import pandas as pd
import numpy as np
from sklearn.decomposition import NMF

class CollaborativeRecommender:
    def __init__(self, n_factors: int = 15):
        self.n_factors = n_factors
        self.model = None
        self.user_features = None
        self.item_features = None
        self.user_to_idx = {}
        self.idx_to_user = {}
        self.item_to_idx = {}
        self.idx_to_item = {}
        self.global_mean = 3.0
        self.user_means = {}
        self.item_means = {}

    def fit(self, ratings_df: pd.DataFrame):
        """
        Trains the NMF collaborative filtering model on user ratings.
        """
        if ratings_df.empty:
            return

        # Calculate means for baseline/fallback
        self.global_mean = ratings_df['rating'].mean()
        self.user_means = ratings_df.groupby('userId')['rating'].mean().to_dict()
        self.item_means = ratings_df.groupby('movieId')['rating'].mean().to_dict()

        # Pivot to create user-item matrix
        # Columns: movieId, Index: userId, Values: rating
        user_item_matrix = ratings_df.pivot(index='userId', columns='movieId', values='rating')
        
        # Keep tracking user and item indices
        self.user_to_idx = {uid: i for i, uid in enumerate(user_item_matrix.index)}
        self.idx_to_user = {i: uid for i, uid in enumerate(user_item_matrix.index)}
        self.item_to_idx = {iid: j for j, iid in enumerate(user_item_matrix.columns)}
        self.idx_to_item = {j: iid for j, iid in enumerate(user_item_matrix.columns)}

        # Fill NaNs with 0 for NMF (Non-negative Matrix Factorization)
        # Note: filling with 0 indicates no rating. To prevent NMF from treating 0 as "terrible",
        # we can train on the sparse representation or standard NMF.
        # Standard NMF on filled 0s works reasonably well for small recommendation projects.
        matrix_filled = user_item_matrix.fillna(0).values
        
        # Fit NMF model
        self.model = NMF(n_components=min(self.n_factors, matrix_filled.shape[1], matrix_filled.shape[0]), init='random', random_state=42, max_iter=200)
        self.user_features = self.model.fit_transform(matrix_filled)
        self.item_features = self.model.components_

    def predict_rating(self, user_id: int, movie_id: int) -> float:
        """
        Predicts the rating user_id would give to movie_id.
        """
        user_idx = self.user_to_idx.get(user_id)
        item_idx = self.item_to_idx.get(movie_id)

        # Baseline prediction
        u_mean = self.user_means.get(user_id, self.global_mean)
        i_mean = self.item_means.get(movie_id, self.global_mean)
        baseline = (u_mean + i_mean) / 2.0

        if user_idx is None or item_idx is None:
            # Cold-start case
            return float(baseline)

        # Calculate NMF dot product reconstruction
        # Since standard NMF fits 0s, the dot product will be lower for unrated items.
        # We adjust the score by mixing baseline rating and dot product rating.
        reconstructed = float(np.dot(self.user_features[user_idx], self.item_features[:, item_idx]))
        
        # If NMF reconstruction is zero or very low, we rely on the baseline
        if reconstructed < 0.1:
            return float(baseline)

        # Scale and clip rating to standard scale (0.5 to 5.0)
        prediction = 0.6 * reconstructed + 0.4 * baseline
        return float(np.clip(prediction, 0.5, 5.0))

    def get_recommendations(self, user_id: int, rated_movie_ids: list[int], all_movie_ids: list[int], n: int = 10):
        """
        Predicts ratings for all unrated movies and returns the top n.
        """
        predictions = []
        rated_set = set(rated_movie_ids)

        for mid in all_movie_ids:
            if mid not in rated_set:
                score = self.predict_rating(user_id, mid)
                predictions.append((mid, score))

        # Sort by predicted score descending
        predictions = sorted(predictions, key=lambda x: x[1], reverse=True)
        return predictions[:n]

    def save(self, file_path: str):
        joblib.dump({
            "model": self.model,
            "user_features": self.user_features,
            "item_features": self.item_features,
            "user_to_idx": self.user_to_idx,
            "idx_to_user": self.idx_to_user,
            "item_to_idx": self.item_to_idx,
            "idx_to_item": self.idx_to_item,
            "global_mean": self.global_mean,
            "user_means": self.user_means,
            "item_means": self.item_means,
            "n_factors": self.n_factors
        }, file_path)

    def load(self, file_path: str):
        data = joblib.load(file_path)
        self.model = data["model"]
        self.user_features = data["user_features"]
        self.item_features = data["item_features"]
        self.user_to_idx = data["user_to_idx"]
        self.idx_to_user = data["idx_to_user"]
        self.item_to_idx = data["item_to_idx"]
        self.idx_to_item = data["idx_to_item"]
        self.global_mean = data["global_mean"]
        self.user_means = data["user_means"]
        self.item_means = data["item_means"]
        self.n_factors = data["n_factors"]
