import mysql.connector
from flask import make_response
from configs.config import dbconfig
from datetime import datetime

class WishlistModel:
    def __init__(self):
        try:
            self.conn = mysql.connector.connect(
                host=dbconfig["host"],
                port=dbconfig["port"],
                user=dbconfig["user"],
                password=dbconfig["password"],
                database=dbconfig["database"],
                autocommit=True
            )
            print("Wishlist DB Connection established")
        except Exception as e:
            print(f"Error connecting to database: {e}")
            self.conn = None

    def log_activity(self, user_id, action):
        """Log user activity to sm_user_activity table"""
        try:
            cursor = self.conn.cursor()
            query = "INSERT INTO sm_user_activity (user_id, action, timestamp) VALUES (%s, %s, %s)"
            cursor.execute(query, (user_id, action, datetime.now()))
            cursor.close()
        except Exception as e:
            print(f"Error logging activity: {e}")

    def add_to_wishlist(self, user_id, item_type, item_id, title):
        """Add a book or movie to user's wishlist"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        # Validate item_type
        if item_type not in ['book', 'movie']:
            return make_response({"error": "Invalid item type. Must be 'book' or 'movie'"}, 400)

        # Validate required fields
        if not item_id or not title:
            return make_response({"error": "item_id and title are required"}, 400)

        try:
            cursor = self.conn.cursor(dictionary=True)

            # Check if item already exists in wishlist
            check_query = """
                SELECT id FROM sm_wishlist 
                WHERE user_id = %s AND item_type = %s AND item_id = %s
            """
            cursor.execute(check_query, (user_id, item_type, item_id))
            existing = cursor.fetchone()

            if existing:
                cursor.close()
                return make_response({"message": "Item already in wishlist"}, 200)

            # Add to wishlist
            insert_query = """
                INSERT INTO sm_wishlist (user_id, item_type, item_id, title) 
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(insert_query, (user_id, item_type, item_id, title))
            cursor.close()

            # Log activity
            self.log_activity(user_id, f"Added {item_type} '{title}' to wishlist")

            return make_response({"message": f"{item_type.capitalize()} added to wishlist successfully"}, 201)

        except Exception as e:
            print(f"Error adding to wishlist: {e}")
            return make_response({"error": "Failed to add to wishlist"}, 500)

    def get_wishlist(self, user_id, item_type=None):
        """Get user's wishlist, optionally filtered by item_type"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)

            if item_type:
                # Validate item_type
                if item_type not in ['book', 'movie']:
                    cursor.close()
                    return make_response({"error": "Invalid item type. Must be 'book' or 'movie'"}, 400)
                
                query = """
                    SELECT id, item_type, item_id, title, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s AND item_type = %s
                    ORDER BY added_at DESC
                """
                cursor.execute(query, (user_id, item_type))
            else:
                query = """
                    SELECT id, item_type, item_id, title, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s
                    ORDER BY added_at DESC
                """
                cursor.execute(query, (user_id,))

            wishlist_items = cursor.fetchall()
            cursor.close()

            # Log activity
            self.log_activity(user_id, "Viewed wishlist")

            return make_response({
                "wishlist": wishlist_items,
                "count": len(wishlist_items)
            }, 200)

        except Exception as e:
            print(f"Error fetching wishlist: {e}")
            return make_response({"error": "Failed to fetch wishlist"}, 500)

    def remove_from_wishlist(self, user_id, wishlist_id):
        """Remove an item from user's wishlist"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)

            # Get item details before deleting for activity log
            select_query = """
                SELECT item_type, title FROM sm_wishlist 
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(select_query, (wishlist_id, user_id))
            item = cursor.fetchone()

            if not item:
                cursor.close()
                return make_response({"error": "Wishlist item not found or unauthorized"}, 404)

            # Delete from wishlist
            delete_query = "DELETE FROM sm_wishlist WHERE id = %s AND user_id = %s"
            cursor.execute(delete_query, (wishlist_id, user_id))
            cursor.close()

            # Log activity
            self.log_activity(user_id, f"Removed {item['item_type']} '{item['title']}' from wishlist")

            return make_response({"message": "Item removed from wishlist successfully"}, 200)

        except Exception as e:
            print(f"Error removing from wishlist: {e}")
            return make_response({"error": "Failed to remove from wishlist"}, 500)

    def clear_wishlist(self, user_id, item_type=None):
        """Clear user's entire wishlist or by type"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

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

    def get_user_activity(self, user_id, limit=50):
        """Get user activity log"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)

            query = """
                SELECT id, action, timestamp 
                FROM sm_user_activity 
                WHERE user_id = %s
                ORDER BY timestamp DESC
                LIMIT %s
            """
            cursor.execute(query, (user_id, limit))
            activities = cursor.fetchall()
            cursor.close()

            return make_response({
                "activities": activities,
                "count": len(activities)
            }, 200)

        except Exception as e:
            print(f"Error fetching user activity: {e}")
            return make_response({"error": "Failed to fetch user activity"}, 500)