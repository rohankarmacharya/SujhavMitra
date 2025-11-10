import mysql.connector
import json
from flask import make_response
from configs.config import dbconfig
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WishlistModel:
    def __init__(self):
        self.conn = None
        self.connect()

    def connect(self):
        """Establish database connection"""
        try:
            if self.conn and self.conn.is_connected():
                return True
                
            self.conn = mysql.connector.connect(
                host=dbconfig["host"],
                port=dbconfig["port"],
                user=dbconfig["user"],
                password=dbconfig["password"],
                database=dbconfig["database"],
                autocommit=True
            )
            logger.info("Successfully connected to the database")
            return True
        except mysql.connector.Error as err:
            logger.error(f"Database connection error: {err}")
            self.conn = None
            return False

    def execute_query(self, query, params=None, fetch=True):
        """Execute a database query with error handling and reconnection"""
        max_retries = 2
        for attempt in range(max_retries):
            try:
                if not self.connect():
                    raise Exception("Failed to connect to database")
                    
                cursor = self.conn.cursor(dictionary=True)
                cursor.execute(query, params or ())
                
                if fetch:
                    result = cursor.fetchall()
                    cursor.close()
                    return result
                
                cursor.close()
                return True
                
            except mysql.connector.Error as err:
                logger.error(f"Database error (attempt {attempt + 1}): {err}")
                self.conn = None  # Force reconnection on next attempt
                if attempt == max_retries - 1:  # Last attempt
                    raise

    def log_activity(self, user_id, action):
        """Log user activity to sm_user_activity table"""
        try:
            query = """
                INSERT INTO sm_user_activity (user_id, action, timestamp) 
                VALUES (%s, %s, %s)
            """
            self.execute_query(query, (user_id, action, datetime.now()), fetch=False)
        except Exception as e:
            logger.error(f"Error logging activity: {e}")

    def add_to_wishlist(self, user_id, item_type, item_id, title, **kwargs):
        """
        Add a book or movie to user's wishlist
        
        Args:
            user_id: The ID of the user
            item_type: Type of the item ('book' or 'movie')
            item_id: ID of the item
            title: Title of the item
            **kwargs: Additional item data to be stored as JSON
            
        Returns:
            Response with success/error message
        """
        # Validate item_type
        if item_type not in ['book', 'movie']:
            return make_response({"error": "Invalid item type. Must be 'book' or 'movie'"}, 400)

        # Validate required fields
        if not item_id or not title:
            return make_response({"error": "item_id and title are required"}, 400)

        try:
            # Check if item already exists in wishlist
            check_query = """
                SELECT id FROM sm_wishlist 
                WHERE user_id = %s AND item_type = %s AND item_id = %s
            """
            existing = self.execute_query(check_query, (user_id, item_type, item_id))

            if existing and len(existing) > 0:
                return make_response({"message": "Item already in wishlist"}, 200)

            # Prepare item data
            item_data = {
                'id': item_id,
                'title': title,
                'type': item_type,
                **{k: v for k, v in kwargs.items() if v is not None}  # Include any additional fields
            }
            
            # Add to wishlist with complete data
            insert_query = """
                INSERT INTO sm_wishlist 
                (user_id, item_type, item_id, title, data, added_at) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            self.execute_query(
                insert_query, 
                (user_id, item_type, item_id, title, json.dumps(item_data), datetime.now()),
                fetch=False
            )

            # Log activity
            self.log_activity(user_id, f"Added {item_type} '{title}' to wishlist")

            return make_response({
                "message": f"{item_type.capitalize()} added to wishlist successfully",
                "status": "success"
            }, 201)

        except Exception as e:
            logger.error(f"Error in add_to_wishlist: {str(e)}")
            return make_response({
                "error": "Failed to add to wishlist",
                "details": str(e)
            }, 500)

    def get_wishlist(self, user_id, item_type=None):
        """Get user's wishlist, optionally filtered by item_type"""
        try:
            if item_type and item_type not in ['book', 'movie']:
                return make_response({
                    "error": "Invalid item type. Must be 'book' or 'movie'"
                }, 400)
            
            # Get wishlist items with their data
            if item_type:
                query = """
                    SELECT id, item_type, item_id, title, data, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s AND item_type = %s
                    ORDER BY added_at DESC
                """
                items = self.execute_query(query, (user_id, item_type)) or []
            else:
                query = """
                    SELECT id, item_type, item_id, title, data, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s
                    ORDER BY added_at DESC
                """
                items = self.execute_query(query, (user_id,)) or []
                
            # Merge data with item details if available
            for item in items:
                if item.get('data') and isinstance(item['data'], str):
                    try:
                        item['data'] = json.loads(item['data'])
                    except (json.JSONDecodeError, TypeError):
                        # If data is not valid JSON, keep it as is
                        pass

            return make_response({
                "wishlist": items,
                "count": len(items)
            }, 200)

        except Exception as e:
            logger.error(f"Error in get_wishlist: {str(e)}")
            return make_response({
                "error": "Failed to fetch wishlist",
                "details": str(e)
            }, 500)

    def remove_from_wishlist(self, user_id, wishlist_id):
        """Remove a specific item from wishlist by its wishlist ID"""
        try:
            # First get the item details for logging
            get_query = """
                SELECT id, item_type, title, user_id 
                FROM sm_wishlist 
                WHERE id = %s AND user_id = %s
            """
            item = self.execute_query(get_query, (wishlist_id, user_id))
            
            if not item or len(item) == 0:
                return make_response({
                    "error": "Item not found in wishlist"
                }, 404)

            item = item[0]  # Get the first (and should be only) result

            # Delete the item
            delete_query = """
                DELETE FROM sm_wishlist 
                WHERE id = %s AND user_id = %s
            """
            self.execute_query(delete_query, (wishlist_id, user_id), fetch=False)

            # Log activity
            self.log_activity(
                user_id, 
                f"Removed {item['item_type']} '{item['title']}' from wishlist"
            )

            return make_response({
                "message": "Item removed from wishlist",
                "status": "success"
            }, 200)

        except Exception as e:
            logger.error(f"Error in remove_from_wishlist: {str(e)}")
            return make_response({
                "error": "Failed to remove item from wishlist",
                "details": str(e)
            }, 500)

    def clear_wishlist(self, user_id, item_type=None):
        """Clear user's entire wishlist or by type"""
        try:
            cursor = self.conn.cursor()

            if item_type:
                # Validate item_type
                if item_type not in ['book', 'movie']:
                    cursor.close()
                    return make_response({"error": "Invalid item type. Must be 'book' or 'movie'"}, 400)
                
                query = "DELETE FROM sm_wishlist WHERE user_id = %s AND item_type = %s"
                cursor.execute(query, (user_id, item_type))
                action = f"Cleared all {item_type}s from wishlist"
            else:
                query = "DELETE FROM sm_wishlist WHERE user_id = %s"
                cursor.execute(query, (user_id,))
                action = "Cleared entire wishlist"

            affected_rows = cursor.rowcount
            cursor.close()

            # Log activity
            self.log_activity(user_id, action)

            return make_response({
                "message": "Wishlist cleared successfully",
                "items_removed": affected_rows
            }, 200)

        except Exception as e:
            print(f"Error clearing wishlist: {e}")
            return make_response({"error": "Failed to clear wishlist"}, 500)

    def get_all_activity(self, limit=50):
        """Get activity logs of all users (admin only)"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)
            query = """
                SELECT id, user_id, action, timestamp
                FROM sm_user_activity
                ORDER BY timestamp DESC
                LIMIT %s
            """
            cursor.execute(query, (limit,))
            activities = cursor.fetchall()
            cursor.close()

            return make_response({
                "activities": activities,
                "count": len(activities)
            }, 200)
        except Exception as e:
            print(f"Error fetching all user activity: {e}")
            return make_response({"error": "Failed to fetch activity"}, 500)
