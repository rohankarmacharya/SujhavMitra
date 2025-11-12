import pickle
from flask import make_response
import numpy as np
import ast
import pandas as pd


class MovieRecommendModel:
    def __init__(self):
        # Load data
        with open("models/movie_list.pkl", "rb") as f:
            self.movies = pickle.load(f)
        with open("models/movie_homepage_link.pkl", "rb") as f:
            homepage_df  = pickle.load(f)
        with open("models/similarity_movies.pkl", "rb") as f:
            self.similarity = pickle.load(f)

        homepage_df["movie_id"] = homepage_df["movie_id"].astype(int)
        self.movies["movie_id"] = self.movies["movie_id"].astype(int)

        self.movie_homepage_link = dict(zip(homepage_df['movie_id'], homepage_df['homepage']))
        self.cast_lookup = dict(zip(homepage_df["movie_id"], homepage_df["cast_original"]))
        self.crew_lookup = dict(zip(homepage_df["movie_id"], homepage_df["crew_original"]))

        # Preprocess and cache normalized titles
        self.movies["normalized_title"] = self.movies["title"].str.lower().str.strip()
        self.movie_titles = set(self.movies["normalized_title"])

    # Safely parse a string representation of a Python list into a real list. If parsing fails or val is not a list, return val as is.
    def safe_parse_list(self, val):
        try:
            parsed = ast.literal_eval(val)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return val

    # Format a row from the movies data into a dictionary for API response. Parse fields like 'cast' and 'genres' that may be stored as stringified lists. Handle 'overview' that might be a list or a string.
    def format_movie_row(self, row):
        # cast = self.safe_parse_list(row["cast"])
        genres = self.safe_parse_list(row["genres"])

        overview = row["overview"]
        if isinstance(overview, list):
            overview = " ".join(str(word) for word in overview)

        movie_id = int(row["movie_id"])
        movie = {
            "id": movie_id,
            "title": str(row["title"]),
            "overview": overview,
            "genres": genres,
            # "cast": cast,
            # "crew": str(row["crew"]),
            "cast": self.cast_lookup.get(movie_id),
            "crew": self.crew_lookup.get(movie_id)
        }

        # Add homepage link
        homepage = self.movie_homepage_link.get(movie_id)
        movie["homepage"] = None if pd.isna(homepage) else homepage

        # Add poster/image if available
        for col in ["poster_url", "poster_path", "image_url", "backdrop_path"]:
            if col in row and not (
                row[col] is None or (isinstance(row[col], float) and np.isnan(row[col]))
            ):
                movie["image"] = str(row[col])
                break

        # Add popularity and vote_average here
        movie["popularity"] = float(row["popularity"]) if "popularity" in row and not np.isnan(row["popularity"]) else None
        movie["vote_average"] = float(row["vote_average"]) if "vote_average" in row and not np.isnan(row["vote_average"]) else None

        return movie


    # Get the first 15 unique movies
    def get_all_movie_titles(self):
        unique_titles = self.movies.drop_duplicates("title")[:15]

        movie_titles_info = []
        for _, row in unique_titles.iterrows():
            movie_titles_info.append(self.format_movie_row(row))

        return make_response({"popular_movie": movie_titles_info}, 200)

    # Get top 10 popular movies based on 'popularity' or 'vote_average'
    def get_popular_movies(self):
        if (
            "popularity" in self.movies.columns
            and not self.movies["popularity"].isnull().all()
        ):
            sorted_df = self.movies.sort_values(
                "popularity", ascending=False
            ).drop_duplicates("title")[:10]
        elif (
            "vote_average" in self.movies.columns
            and not self.movies["vote_average"].isnull().all()
        ):
            sorted_df = self.movies.sort_values(
                "vote_average", ascending=False
            ).drop_duplicates("title")[:10]
        else:
            return make_response(
                {"error": "No popularity or vote data available."}, 400
            )

        popular_movie_titles_info = []
        for _, row in sorted_df.iterrows():
            popular_movie_titles_info.append(self.format_movie_row(row))

        return make_response({"popular_movie": popular_movie_titles_info}, 200)

    # Recommend similar movies based on similarity index
    def movie_recommend_model(self, title):
        normalized_title = title.lower().strip()

        if normalized_title not in self.movie_titles:
            return make_response({"error": "Movie not found"}, 404)

        # Get index of the matched movie
        index = self.movies[self.movies["normalized_title"] == normalized_title].index[0]
        distances = self.similarity[index]

        # Get top 5 similar movies (excluding itself)
        top_indices = np.argsort(-distances)[1:11]

        recommendations = []
        for i in top_indices:
            row = self.movies.iloc[i]
            movie_data = self.format_movie_row(row)

            # Calculate similarity percentage
            similarity_percent = round(float(distances[i]) * 100, 2)
            movie_data["similarity"] = f"{similarity_percent}%"

            recommendations.append(movie_data)

        return make_response({"recommendations": recommendations}, 200)


    # Get single movie by ID
    def get_movie_by_id(self, movie_id: int):
        try:
            # Locate by movie_id column (ensure numeric compare)
            matched = self.movies[self.movies["movie_id"].astype(int) == int(movie_id)]
            if matched.empty:
                return make_response({"error": "Movie not found"}, 404)
            row = matched.iloc[0]
            return make_response(self.format_movie_row(row), 200)
        except Exception:
            return make_response({"error": "Failed to fetch movie"}, 500)