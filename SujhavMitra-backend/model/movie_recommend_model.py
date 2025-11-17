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
            homepage_df = pickle.load(f)
        with open("models/similarity_movies.pkl", "rb") as f:
            self.similarity = pickle.load(f)
        
        # Load TF-IDF vectorizer and vectors
        with open("models/tfidf_vectorizer.pkl", "rb") as f:
            self.vectorizer = pickle.load(f)
        with open("models/tfidf_vectors.pkl", "rb") as f:
            self.vectors = pickle.load(f)

        homepage_df["movie_id"] = homepage_df["movie_id"].astype(int)
        self.movies["movie_id"] = self.movies["movie_id"].astype(int)

        self.movie_homepage_link = dict(zip(homepage_df['movie_id'], homepage_df['homepage']))
        self.cast_lookup = dict(zip(homepage_df["movie_id"], homepage_df["cast_original"]))
        self.crew_lookup = dict(zip(homepage_df["movie_id"], homepage_df["crew_original"]))

        # Preprocess and cache normalized titles
        self.movies["normalized_title"] = self.movies["title"].str.lower().str.strip()
        self.movie_titles = set(self.movies["normalized_title"])
        
        # Get feature names from vectorizer
        self.feature_names = self.vectorizer.get_feature_names_out()

    def safe_parse_list(self, val):
        """Safely parse a string representation of a Python list into a real list."""
        try:
            parsed = ast.literal_eval(val)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass
        return val

    def get_tfidf_scores(self, movie_index, top_n=20):
        """
        Get top TF-IDF scores for a movie by index.
        Returns list of (feature, score) tuples.
        """
        movie_vector = self.vectors[movie_index]
        
        # Get non-zero TF-IDF scores
        non_zero_indices = np.where(movie_vector > 0)[0]
        tfidf_scores = [(self.feature_names[i], float(movie_vector[i])) 
                       for i in non_zero_indices]
        tfidf_scores_sorted = sorted(tfidf_scores, key=lambda x: x[1], reverse=True)
        
        return tfidf_scores_sorted[:top_n]

    def get_common_features(self, index1, index2, top_n=10):
        """
        Get common TF-IDF features between two movies that contribute to their similarity.
        Returns list of (feature, score1, score2, combined_score) tuples.
        """
        vector1 = self.vectors[index1]
        vector2 = self.vectors[index2]
        
        # Find features that are non-zero in both vectors
        common_indices = np.where((vector1 > 0) & (vector2 > 0))[0]
        
        common_features = []
        for idx in common_indices:
            feature = self.feature_names[idx]
            score1 = float(vector1[idx])
            score2 = float(vector2[idx])
            # Combined score (product shows contribution to similarity)
            combined = score1 * score2
            common_features.append({
                "feature": feature,
                "score_movie1": round(score1, 4),
                "score_movie2": round(score2, 4),
                "contribution": round(combined, 4)
            })
        
        # Sort by contribution to similarity
        common_features_sorted = sorted(common_features, 
                                       key=lambda x: x["contribution"], 
                                       reverse=True)
        
        return common_features_sorted[:top_n]

    def format_movie_row(self, row):
        """Format a row from the movies data into a dictionary for API response."""
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

        # Add popularity and vote_average
        movie["popularity"] = float(row["popularity"]) if "popularity" in row and not np.isnan(row["popularity"]) else None
        movie["vote_average"] = float(row["vote_average"]) if "vote_average" in row and not np.isnan(row["vote_average"]) else None

        return movie

    def get_all_movie_titles(self):
        """Get the first 15 unique movies"""
        unique_titles = self.movies.drop_duplicates("title")[:15]

        movie_titles_info = []
        for _, row in unique_titles.iterrows():
            movie_titles_info.append(self.format_movie_row(row))

        return make_response({"popular_movie": movie_titles_info}, 200)

    def get_popular_movies(self):
        """Get top 10 popular movies based on 'popularity' or 'vote_average'"""
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

    def movie_recommend_model(self, title, include_tfidf=False, top_features=10):
        """
        Recommend similar movies based on similarity index.
        
        Args:
            title: Movie title to find recommendations for
            include_tfidf: If True, include TF-IDF analysis in response
            top_features: Number of top TF-IDF features to include
        """
        normalized_title = title.lower().strip()

        if normalized_title not in self.movie_titles:
            return make_response({"error": "Movie not found"}, 404)

        # Get index of the matched movie
        index = self.movies[self.movies["normalized_title"] == normalized_title].index[0]
        distances = self.similarity[index]

        # Get top 10 similar movies (excluding itself)
        top_indices = np.argsort(-distances)[1:11]

        recommendations = []
        for i in top_indices:
            row = self.movies.iloc[i]
            movie_data = self.format_movie_row(row)

            # Calculate similarity percentage
            similarity_percent = round(float(distances[i]) * 100, 2)
            movie_data["similarity"] = f"{similarity_percent}%"
            
            # Add TF-IDF analysis if requested
            if include_tfidf:
                # Get common features between query movie and this recommendation
                common_features = self.get_common_features(index, i, top_n=top_features)
                movie_data["common_features"] = common_features

            recommendations.append(movie_data)

        response_data = {"recommendations": recommendations}
        
        # Add TF-IDF scores for the query movie if requested
        if include_tfidf:
            query_tfidf = self.get_tfidf_scores(index, top_n=top_features)
            response_data["query_movie_tfidf"] = [
                {"feature": feat, "score": round(score, 4)} 
                for feat, score in query_tfidf
            ]
            response_data["query_movie_title"] = title

        return make_response(response_data, 200)

    def get_movie_tfidf_analysis(self, title, top_n=20):
        """
        Get detailed TF-IDF analysis for a specific movie.
        
        Args:
            title: Movie title
            top_n: Number of top features to return
        """
        normalized_title = title.lower().strip()

        if normalized_title not in self.movie_titles:
            return make_response({"error": "Movie not found"}, 404)

        index = self.movies[self.movies["normalized_title"] == normalized_title].index[0]
        row = self.movies.iloc[index]
        
        # Get TF-IDF scores
        tfidf_scores = self.get_tfidf_scores(index, top_n=top_n)
        
        response = {
            "movie": self.format_movie_row(row),
            "tfidf_features": [
                {"feature": feat, "score": round(score, 4)} 
                for feat, score in tfidf_scores
            ],
            "total_features": int(np.sum(self.vectors[index] > 0))
        }
        
        return make_response(response, 200)

    def get_movie_by_id(self, movie_id: int):
        """Get single movie by ID"""
        try:
            matched = self.movies[self.movies["movie_id"].astype(int) == int(movie_id)]
            if matched.empty:
                return make_response({"error": "Movie not found"}, 404)
            row = matched.iloc[0]
            return make_response(self.format_movie_row(row), 200)
        except Exception:
            return make_response({"error": "Failed to fetch movie"}, 500)