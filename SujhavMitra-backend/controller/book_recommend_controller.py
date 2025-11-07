from flask import request, Blueprint
from model.book_recommend_model import BookRecommendModel

recommender = BookRecommendModel()

book_bp = Blueprint("book", __name__)

@book_bp.route("/recommend/book", methods=["GET"])
def book_recommend_controller():
    raw_title = request.args.get("title")
    if not raw_title:
        Popular_books = recommender.get_popular_book_title()
        return  Popular_books
    
    # Normalize title input
    title = raw_title.strip().strip('"').strip("'").lower()
    result=recommender.book_recommend_model(title)

    return result

@book_bp.route("/book/<isbn>", methods=["GET"])
def get_book_by_isbn_controller(isbn):
    return recommender.get_book_by_isbn(isbn)

@book_bp.route("/book/by-title", methods=["GET"])
def get_book_by_title_controller():
    title = request.args.get("title", type=str)
    if not title:
        return {"error": "title is required"}, 400
    return recommender.get_book_by_title(title)
