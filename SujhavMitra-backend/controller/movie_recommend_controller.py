from flask import request, Blueprint
from model.movie_recommend_model import MovieRecommendModel

recommender = MovieRecommendModel()

movie_bp = Blueprint("movie", __name__)

@movie_bp.route("/recommend/movie", methods=["GET"])
def movie_recommend_controller():
    raw_title = request.args.get("title")
    
    if not raw_title:
        all_movies = recommender.get_popular_movies()
        return all_movies
    
    title = raw_title.strip().strip('"').strip("'")
    result = recommender.movie_recommend_model(title)

    return result

@movie_bp.route("/movie/<int:movie_id>", methods=["GET"])
def get_movie_by_id_controller(movie_id):
    return recommender.get_movie_by_id(movie_id)