import os
import numpy as np
import pandas as pd
from app.ml.data_loader import load_movielens_data
from app.ml.content_based import ContentBasedRecommender
from app.ml.collaborative import CollaborativeRecommender

def evaluate_collaborative_model(collab_model, ratings_df):
    """
    Evaluates the collaborative filtering model using RMSE and MAE.
    Uses simple train-test split for evaluation.
    """
    if ratings_df.empty:
        return 0.0, 0.0

    # Shuffle and split 80/20
    shuffled_df = ratings_df.sample(frac=1, random_state=42).reset_index(drop=True)
    split_idx = int(len(shuffled_df) * 0.8)
    train_df = shuffled_df.iloc[:split_idx]
    test_df = shuffled_df.iloc[split_idx:]

    # Train on 80%
    eval_model = CollaborativeRecommender(n_factors=collab_model.n_factors)
    eval_model.fit(train_df)

    # Predict on test set
    squared_errors = []
    absolute_errors = []
    
    for _, row in test_df.iterrows():
        pred = eval_model.predict_rating(int(row['userId']), int(row['movieId']))
        actual = row['rating']
        
        squared_errors.append((pred - actual) ** 2)
        absolute_errors.append(abs(pred - actual))

    rmse = np.sqrt(np.mean(squared_errors)) if squared_errors else 0.0
    mae = np.mean(absolute_errors) if absolute_errors else 0.0

    return rmse, mae

def train_all_models():
    # Setup directories
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, "data")
    models_dir = os.path.join(base_dir, "models")

    if not os.path.exists(models_dir):
        os.makedirs(models_dir)

    print("Step 1: Loading MovieLens dataset...")
    movies_df, ratings_df = load_movielens_data(data_dir)

    print("Step 2: Training Content-Based model...")
    content_recommender = ContentBasedRecommender()
    content_recommender.fit(movies_df)
    
    content_model_path = os.path.join(models_dir, "content_model.pkl")
    content_recommender.save(content_model_path)
    print(f"Content-Based model saved to {content_model_path}")

    print("Step 3: Training Collaborative Filtering model...")
    collab_recommender = CollaborativeRecommender(n_factors=15)
    collab_recommender.fit(ratings_df)
    
    collab_model_path = os.path.join(models_dir, "collab_model.pkl")
    collab_recommender.save(collab_model_path)
    print(f"Collaborative Filtering model saved to {collab_model_path}")

    print("Step 4: Evaluating models...")
    rmse, mae = evaluate_collaborative_model(collab_recommender, ratings_df)
    print(f"Collaborative Filtering model metrics:")
    print(f"  - RMSE: {rmse:.4f}")
    print(f"  - MAE:  {mae:.4f}")
    print("Training complete!")

if __name__ == "__main__":
    train_all_models()
