from flask import request, Blueprint, jsonify
from model.rating_model import RatingModel
from model.auth_model import auth_model
import jwt
from configs.config import JWT_SECRET

rating_model = RatingModel()
auth = auth_model()
rating_bp = Blueprint("rating", __name__)

def get_current_user_id():
    """Extract user_id from JWT token in Authorization header"""
    authorization = request.headers.get("authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    try:
        tokendata = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        # Your JWT structure: tokendata['payload']['id']
        return tokendata['payload']['id']
    except Exception as e:
        print(f"Error decoding token: {e}")
        return None


@rating_bp.route("/rating/add", methods=["POST"])
@auth.token_auth()
def add_rating():
    """Add or update a rating for the logged-in user"""
    # Get user_id from JWT token
    user_id = get_current_user_id()
    
    if not user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    data = request.get_json()
    
    isbn = data.get("isbn")
    book_title = data.get("book_title")
    rating = data.get("rating")
    
    if not all([isbn, book_title, rating]):
        return jsonify({"error": "isbn, book_title, and rating are required"}), 400
    
    try:
        rating = int(rating)
        if rating < 1 or rating > 10:
            return jsonify({"error": "Rating must be between 1 and 10"}), 400
    except ValueError:
        return jsonify({"error": "Rating must be a valid integer"}), 400
    
    return rating_model.add_rating(user_id, isbn, book_title, rating)


@rating_bp.route("/rating/my-ratings", methods=["GET"])
@auth.token_auth()
def get_my_ratings():
    """Get all ratings by the logged-in user"""
    # Get user_id from JWT token
    user_id = get_current_user_id()
    
    if not user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    return rating_model.get_user_ratings(user_id)


@rating_bp.route("/rating/user/<int:user_id>", methods=["GET"])
@auth.token_auth()
def get_user_ratings(user_id):
    """Get all ratings by a specific user (admin/moderator access)"""
    # Optional: Add role check if only admins should see other users' ratings
    current_user_id = get_current_user_id()
    
    if not current_user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    return rating_model.get_user_ratings(user_id)


@rating_bp.route("/rating/update/<int:rating_id>", methods=["PATCH"])
@auth.token_auth()
def update_rating(rating_id):
    """Update an existing rating (only by the owner)"""
    user_id = get_current_user_id()
    
    if not user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    data = request.get_json()
    new_rating = data.get("rating")
    
    if not new_rating:
        return jsonify({"error": "rating is required"}), 400
    
    try:
        new_rating = int(new_rating)
        if new_rating < 1 or new_rating > 10:
            return jsonify({"error": "Rating must be between 1 and 10"}), 400
    except ValueError:
        return jsonify({"error": "Rating must be a valid integer"}), 400
    
    # Verify ownership before updating
    return rating_model.update_rating(rating_id, new_rating, user_id)


@rating_bp.route("/rating/delete/<int:rating_id>", methods=["DELETE"])
@auth.token_auth()
def delete_rating(rating_id):
    """Delete a rating (only by the owner)"""
    user_id = get_current_user_id()
    
    if not user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    # Verify ownership before deleting
    return rating_model.delete_rating(rating_id, user_id)


@rating_bp.route("/recommend/my-recommendations", methods=["GET"])
@auth.token_auth()
def get_my_recommendations():
    """Get personalized recommendations for the logged-in user"""
    user_id = get_current_user_id()
    
    if not user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    limit = request.args.get("limit", default=10, type=int)
    return rating_model.get_recommendations_for_user(user_id, limit)


@rating_bp.route("/recommend/user/<int:user_id>", methods=["GET"])
@auth.token_auth()
def get_user_recommendations(user_id):
    """Get recommendations for a specific user (for testing/admin)"""
    current_user_id = get_current_user_id()
    
    if not current_user_id:
        return jsonify({"error": "Unable to identify user"}), 401
    
    limit = request.args.get("limit", default=10, type=int)
    return rating_model.get_recommendations_for_user(user_id, limit)