import os
import pandas as pd
import numpy as np

def load_movielens_data(data_dir: str):
    """
    Loads ratings and movies datasets from the specified data directory.
    If the files do not exist, it generates robust sample data.
    """
    movies_path = os.path.join(data_dir, "movies.csv")
    ratings_path = os.path.join(data_dir, "ratings.csv")

    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    # If movies or ratings don't exist, generate robust seed files
    if not os.path.exists(movies_path) or not os.path.exists(ratings_path):
        print("Dataset files not found. Creating sample MovieLens data...")
        generate_sample_data(data_dir)

    movies_df = pd.read_csv(movies_path)
    ratings_df = pd.read_csv(ratings_path)
    return movies_df, ratings_df

def generate_sample_data(data_dir: str):
    """
    Generates a sample movies.csv and ratings.csv with realistic data.
    """
    # Sample movies across genres
    sample_movies = [
        {"movieId": 1, "title": "Toy Story (1995)", "genres": "Adventure|Animation|Children|Comedy|Fantasy"},
        {"movieId": 2, "title": "Jumanji (1995)", "genres": "Adventure|Children|Fantasy"},
        {"movieId": 3, "title": "Grumpier Old Men (1995)", "genres": "Comedy|Romance"},
        {"movieId": 6, "title": "Heat (1995)", "genres": "Action|Crime|Thriller"},
        {"movieId": 10, "title": "GoldenEye (1995)", "genres": "Action|Adventure|Thriller"},
        {"movieId": 32, "title": "Twelve Monkeys (a.k.a. 12 Monkeys) (1995)", "genres": "Mystery|Sci-Fi|Thriller"},
        {"movieId": 47, "title": "Seven (a.k.a. Se7en) (1995)", "genres": "Mystery|Thriller"},
        {"movieId": 50, "title": "Usual Suspects, The (1995)", "genres": "Crime|Mystery|Thriller"},
        {"movieId": 110, "title": "Braveheart (1995)", "genres": "Action|Drama|War"},
        {"movieId": 150, "title": "Apollo 13 (1995)", "genres": "Adventure|Drama|IMAX"},
        {"movieId": 260, "title": "Star Wars: Episode IV - A New Hope (1977)", "genres": "Action|Adventure|Sci-Fi"},
        {"movieId": 296, "title": "Pulp Fiction (1994)", "genres": "Comedy|Crime|Drama|Thriller"},
        {"movieId": 318, "title": "Shawshank Redemption, The (1994)", "genres": "Crime|Drama"},
        {"movieId": 356, "title": "Forrest Gump (1994)", "genres": "Comedy|Drama|Romance"},
        {"movieId": 480, "title": "Jurassic Park (1993)", "genres": "Action|Adventure|Sci-Fi|Thriller"},
        {"movieId": 527, "title": "Schindler's List (1993)", "genres": "Drama|War"},
        {"movieId": 589, "title": "Terminator 2: Judgment Day (1991)", "genres": "Action|Sci-Fi"},
        {"movieId": 593, "title": "Silence of the Lambs, The (1991)", "genres": "Crime|Horror|Thriller"},
        {"movieId": 858, "title": "Godfather, The (1972)", "genres": "Crime|Drama"},
        {"movieId": 1196, "title": "Star Wars: Episode V - The Empire Strikes Back (1980)", "genres": "Action|Adventure|Sci-Fi"},
        {"movieId": 1197, "title": "Princess Bride, The (1987)", "genres": "Action|Adventure|Comedy|Fantasy|Romance"},
        {"movieId": 1198, "title": "Raiders of the Lost Ark (Indiana Jones) (1981)", "genres": "Action|Adventure"},
        {"movieId": 1210, "title": "Star Wars: Episode VI - Return of the Jedi (1983)", "genres": "Action|Adventure|Sci-Fi"},
        {"movieId": 1270, "title": "Back to the Future (1985)", "genres": "Adventure|Comedy|Sci-Fi"},
        {"movieId": 2028, "title": "Saving Private Ryan (1998)", "genres": "Action|Drama|War"},
        {"movieId": 2571, "title": "Matrix, The (1999)", "genres": "Action|Sci-Fi|Thriller"},
        {"movieId": 2858, "title": "American Beauty (1999)", "genres": "Drama|Romance"},
        {"movieId": 2959, "title": "Fight Club (1999)", "genres": "Action|Crime|Drama|Thriller"},
        {"movieId": 4993, "title": "Lord of the Rings: The Fellowship of the Ring, The (2001)", "genres": "Adventure|Fantasy"},
        {"movieId": 5952, "title": "Lord of the Rings: The Two Towers, The (2002)", "genres": "Adventure|Fantasy"},
        {"movieId": 7153, "title": "Lord of the Rings: The Return of the King, The (2003)", "genres": "Action|Adventure|Drama|Fantasy"},
        {"movieId": 58559, "title": "Dark Knight, The (2008)", "genres": "Action|Crime|Drama|IMAX"},
        {"movieId": 79132, "title": "Inception (2010)", "genres": "Action|Crime|Drama|Mystery|Sci-Fi|Thriller|IMAX"},
        {"movieId": 109487, "title": "Interstellar (2014)", "genres": "Sci-Fi|IMAX"},
    ]

    # Add more movies to make it robust (100 movies total)
    np.random.seed(42)
    genres_pool = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"]
    
    current_ids = [m["movieId"] for m in sample_movies]
    next_id = max(current_ids) + 1
    
    while len(sample_movies) < 100:
        title = f"Sample Movie {len(sample_movies) + 1} ({np.random.randint(1970, 2024)})"
        # Pick 1 to 3 random genres
        num_genres = np.random.randint(1, 4)
        selected_genres = "|".join(np.random.choice(genres_pool, num_genres, replace=False))
        sample_movies.append({"movieId": next_id, "title": title, "genres": selected_genres})
        next_id += 1

    movies_df = pd.DataFrame(sample_movies)
    movies_df.to_csv(os.path.join(data_dir, "movies.csv"), index=False)

    # Generate ratings (ratings for 20 users)
    ratings = []
    for user_id in range(1, 21):
        # Each user rates a random selection of 30 to 70 movies
        num_ratings = np.random.randint(30, 71)
        rated_movies = np.random.choice(movies_df["movieId"].values, num_ratings, replace=False)
        
        # User preferences bias
        user_bias = np.random.uniform(-1.0, 1.0)
        
        for movie_id in rated_movies:
            # Rating scale 0.5 to 5.0 in steps of 0.5
            rating = np.random.normal(3.8 + user_bias, 0.8)
            rating = np.clip(round(rating * 2) / 2, 0.5, 5.0)
            timestamp = 1262304000 + np.random.randint(0, 315360000) # random time from 2010 onwards
            ratings.append({
                "userId": user_id,
                "movieId": movie_id,
                "rating": rating,
                "timestamp": timestamp
            })

    ratings_df = pd.DataFrame(ratings)
    ratings_df.to_csv(os.path.join(data_dir, "ratings.csv"), index=False)
    print(f"Generated {len(movies_df)} movies and {len(ratings_df)} ratings successfully.")
