from app.ml.content_based import ContentBasedRecommender
from app.ml.collaborative import CollaborativeRecommender

class HybridRecommender:
    def __init__(self, content_model: ContentBasedRecommender, collab_model: CollaborativeRecommender, content_weight: float = 0.4, collab_weight: float = 0.6):
        self.content_model = content_model
        self.collab_model = collab_model
        self.content_weight = content_weight
        self.collab_weight = collab_weight

    def get_recommendations(self, user_id: int, favorite_genres: list[str], rated_movie_ids: list[int], all_movie_ids: list[int], n: int = 10):
        """
        Combines content-based and collaborative recommendations.
        Handles cold start: if the user has no ratings and no preferences, returns popular or trending.
        If the user has ratings but is not in collaborative, relies mostly on content-based.
        """
        # If user is completely new (no ratings, no favorite genres)
        if not rated_movie_ids and not favorite_genres:
            # We can't personalize, return top global movies based on popularity/rating
            # Handled by service layer fallback, here we return empty list or all_movie_ids[:n]
            return []

        # Content-based scores
        cb_recs = self.content_model.get_recommendations_from_profile(
            favorite_genres=favorite_genres,
            liked_movie_ids=rated_movie_ids,
            n=len(all_movie_ids)
        )
        cb_scores = {mid: score for mid, score in cb_recs}

        # Normalize content-based scores to [0, 1]
        if cb_scores:
            max_cb = max(cb_scores.values())
            min_cb = min(cb_scores.values())
            range_cb = max_cb - min_cb if max_cb != min_cb else 1.0
            cb_scores_norm = {mid: (score - min_cb) / range_cb for mid, score in cb_scores.items()}
        else:
            cb_scores_norm = {}

        # Collaborative scores
        # We calculate collaborative predictions for all unrated movies
        cf_scores = {}
        rated_set = set(rated_movie_ids)
        
        # Check if user is known in collaborative model
        is_known_user = user_id in self.collab_model.user_to_idx
        
        for mid in all_movie_ids:
            if mid not in rated_set:
                # Predict rating (returns 0.5 to 5.0)
                score = self.collab_model.predict_rating(user_id, mid)
                cf_scores[mid] = score

        # Normalize collaborative scores to [0, 1] (divide by 5.0)
        cf_scores_norm = {mid: score / 5.0 for mid, score in cf_scores.items()}

        # Combine scores
        hybrid_scores = []
        for mid in all_movie_ids:
            if mid in rated_set:
                continue

            cb_score = cb_scores_norm.get(mid, 0.0)
            cf_score = cf_scores_norm.get(mid, 0.0)

            if not is_known_user:
                # Cold start user for collaborative: rely 80% on content-based
                score = 0.8 * cb_score + 0.2 * cf_score
            else:
                # Normal user: mix according to weights
                score = self.content_weight * cb_score + self.collab_weight * cf_score

            hybrid_scores.append((mid, score))

        # Sort by hybrid score descending
        hybrid_scores = sorted(hybrid_scores, key=lambda x: x[1], reverse=True)
        
        return hybrid_scores[:n]
