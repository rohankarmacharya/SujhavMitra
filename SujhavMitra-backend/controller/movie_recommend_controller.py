from flask import request, Blueprint
from model.movie_recommend_model import MovieRecommendModel

recommender = MovieRecommendModel()

movie_bp = Blueprint("movie", __name__)

# Original route - Get recommendations (can optionally include TF-IDF via query params)
@movie_bp.route("/recommend/movie", methods=["GET"])
def movie_recommend_controller():
    raw_title = request.args.get("title")
    
    if not raw_title:
        all_movies = recommender.get_popular_movies()
        return all_movies
    
    title = raw_title.strip().strip('"').strip("'")
    
    # Check if TF-IDF analysis is requested
    include_tfidf = request.args.get("include_tfidf", "false").lower() == "true"
    top_features = int(request.args.get("top_features", 10))
    
    result = recommender.movie_recommend_model(title, include_tfidf=include_tfidf, top_features=top_features)
    return result

# Get movie by ID
@movie_bp.route("/movie/<int:movie_id>", methods=["GET"])
def get_movie_by_id_controller(movie_id):
    return recommender.get_movie_by_id(movie_id)

# New route - Get detailed TF-IDF analysis for a single movie
@movie_bp.route("/movie/tfidf-analysis", methods=["GET"])
def movie_tfidf_analysis_controller():
    raw_title = request.args.get("title")
    
    if not raw_title:
        return {"error": "Movie title is required"}, 400
    
    title = raw_title.strip().strip('"').strip("'")
    top_n = int(request.args.get("top_n", 20))
    
    result = recommender.get_movie_tfidf_analysis(title, top_n=top_n)
    return result

# Optional: Get all movie titles (for dropdown/autocomplete)
@movie_bp.route("/movies/all", methods=["GET"])
def get_all_movies_controller():
    return recommender.get_all_movie_titles()