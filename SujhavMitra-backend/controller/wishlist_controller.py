from flask import request, Blueprint, make_response
from model.wishlist_model import WishlistModel
from model.auth_model import auth_model
import jwt
from configs.config import JWT_SECRET

wishlist_obj = WishlistModel()
auth_obj = auth_model()

wishlist_bp = Blueprint("wishlist", __name__)

def get_user_id_from_token():
    """Extract user_id from JWT token"""
    try:
        authorization = request.headers.get("authorization")
        if not authorization:
            return None
        
        token = authorization.split(" ")[1]
        tokendata = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return tokendata['payload']['id']
    except Exception as e:
        print(f"Error extracting user_id: {e}")
        return None


# Add item to wishlist
@wishlist_bp.route("/wishlist/add", methods=["POST"])
@auth_obj.token_auth()
def add_to_wishlist_controller():
    """
    Add a book or movie to wishlist
    Expected JSON body:
    {
        "item_type": "book" or "movie",
        "item_id": "isbn" or "movie_id",
        "title": "Item title"
    }
    """
    user_id = get_user_id_from_token()
    if not user_id:
        return make_response({"error": "Invalid token"}, 401)

    data = request.get_json()
    if not data:
        return make_response({"error": "Request body is required"}, 400)

    item_type = data.get('item_type')
    item_id = data.get('item_id')
    title = data.get('title')
    
    # Extract all other fields to be stored as item data
    item_data = {k: v for k, v in data.items() 
                if k not in ['item_type', 'item_id', 'title']}

    return wishlist_obj.add_to_wishlist(user_id, item_type, item_id, title, **item_data)


# Get user's wishlist
@wishlist_bp.route("/wishlist", methods=["GET"])
@auth_obj.token_auth()
def view_wishlist_controller():
    """
    Get user's wishlist
    Optional query parameter: ?type=book or ?type=movie
    """
    user_id = get_user_id_from_token()
    if not user_id:
        return make_response({"error": "Invalid token"}, 401)

    item_type = request.args.get('type')  # Optional filter
    return wishlist_obj.get_wishlist(user_id, item_type)


# Remove item from wishlist
@wishlist_bp.route("/wishlist/remove/<int:wishlist_id>", methods=["DELETE"])
@auth_obj.token_auth()
def remove_from_wishlist_controller(wishlist_id):
    """Remove a specific item from wishlist by its wishlist ID"""
    user_id = get_user_id_from_token()
    if not user_id:
        return make_response({"error": "Invalid token"}, 401)

    return wishlist_obj.remove_from_wishlist(user_id, wishlist_id)


# Clear wishlist
@wishlist_bp.route("/wishlist/clear", methods=["DELETE"])
@auth_obj.token_auth()
def clear_wishlist_controller():
    """
    Clear user's entire wishlist
    Optional query parameter: ?type=book or ?type=movie
    """
    user_id = get_user_id_from_token()
    if not user_id:
        return make_response({"error": "Invalid token"}, 401)

    item_type = request.args.get('type')  # Optional filter
    return wishlist_obj.clear_wishlist(user_id, item_type)


# Get user activity
@wishlist_bp.route("/user/activity", methods=["GET"])
@auth_obj.token_auth()
def get_user_activity_controller():
    """
    Get user's activity log
    Optional query parameter: ?limit=100 (default: 50)
    """
    user_id = get_user_id_from_token()
    if not user_id:
        return make_response({"error": "Invalid token"}, 401)

    limit = request.args.get('limit', default=50, type=int)
    if limit > 500:  # Set maximum limit
        limit = 500

    return wishlist_obj.get_user_activity(user_id, limit)


# Error handlers
@wishlist_bp.errorhandler(404)
def not_found(error):
    return make_response({"error": "Endpoint not found"}, 404)

@wishlist_bp.errorhandler(500)
def internal_error(error):
    return make_response({"error": "Internal server error"}, 500)