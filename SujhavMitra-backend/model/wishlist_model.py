import mysql.connector
from flask import make_response
from configs.config import dbconfig
import json
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
            print(f"Error connecting to wishlist database: {e}")
            self.conn = None

    def log_activity(self, user_id, action):
        """Log user activity"""
        if not self.conn:
            return
        try:
            cursor = self.conn.cursor()
            query = "INSERT INTO sm_user_activity (user_id, action, timestamp) VALUES (%s, %s, %s)"
            cursor.execute(query, (user_id, action, datetime.now()))
            cursor.close()
        except Exception as e:
            print(f"Error logging activity: {e}")

    def add_to_wishlist(self, user_id, item_type, item_id, title, **item_data):
        """Add item to wishlist"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            # Validate required fields
            if not item_type or not item_id or not title:
                return make_response({"error": "item_type, item_id, and title are required"}, 400)

            if item_type not in ['book', 'movie']:
                return make_response({"error": "item_type must be 'book' or 'movie'"}, 400)

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
                return make_response({"message": "Item already in wishlist", "wishlist_id": existing['id']}, 200)

            # Store additional data as JSON
            data_json = json.dumps(item_data) if item_data else None

            # Insert new wishlist item
            insert_query = """
                INSERT INTO sm_wishlist (user_id, item_type, item_id, title, data) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (user_id, item_type, item_id, title, data_json))
            
            wishlist_id = cursor.lastrowid
            cursor.close()

            # Log activity
            self.log_activity(user_id, f"Added {item_type} '{title}' to wishlist")

            return make_response({
                "message": "Item added to wishlist successfully",
                "wishlist_id": wishlist_id
            }, 201)

        except mysql.connector.IntegrityError as e:
            print(f"Integrity error in add_to_wishlist: {e}")
            return make_response({"error": "Item already exists in wishlist"}, 400)
        except Exception as e:
            print(f"Error adding to wishlist: {e}")
            import traceback
            traceback.print_exc()
            return make_response({"error": f"Failed to add to wishlist: {str(e)}"}, 500)

    def get_wishlist(self, user_id, item_type=None):
        """Get user's wishlist"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)

            # Build query based on filter
            if item_type:
                query = """
                    SELECT id, user_id, item_type, item_id, title, data, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s AND item_type = %s 
                    ORDER BY added_at DESC
                """
                cursor.execute(query, (user_id, item_type))
            else:
                query = """
                    SELECT id, user_id, item_type, item_id, title, data, added_at 
                    FROM sm_wishlist 
                    WHERE user_id = %s 
                    ORDER BY added_at DESC
                """
                cursor.execute(query, (user_id,))

            results = cursor.fetchall()
            cursor.close()

            # Parse JSON data field for each item
            wishlist_items = []
            for row in results:
                item = {
                    'id': row['id'],
                    'item_type': row['item_type'],
                    'item_id': row['item_id'],
                    'title': row['title'],
                    'added_at': row['added_at'].isoformat() if row['added_at'] else None,
                    'data': {}
                }
                
                # Parse the data JSON field
                if row['data']:
                    try:
                        item['data'] = json.loads(row['data']) if isinstance(row['data'], str) else row['data']
                    except json.JSONDecodeError:
                        print(f"Warning: Could not parse data for wishlist item {row['id']}")
                        item['data'] = {}
                
                wishlist_items.append(item)

            # Log activity
            self.log_activity(user_id, "Viewed wishlist")

            return make_response({
                "wishlist": wishlist_items,
                "count": len(wishlist_items)
            }, 200)

        except Exception as e:
            print(f"Error fetching wishlist: {e}")
            import traceback
            traceback.print_exc()
            return make_response({"error": f"Failed to fetch wishlist: {str(e)}"}, 500)

    def remove_from_wishlist(self, user_id, wishlist_id):
        """Remove item from wishlist by wishlist ID"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor(dictionary=True)

            # Get item details before deletion for logging
            select_query = """
                SELECT item_type, title 
                FROM sm_wishlist 
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(select_query, (wishlist_id, user_id))
            item = cursor.fetchone()

            if not item:
                cursor.close()
                return make_response({"error": "Item not found in wishlist"}, 404)

            # Delete the item
            delete_query = "DELETE FROM sm_wishlist WHERE id = %s AND user_id = %s"
            cursor.execute(delete_query, (wishlist_id, user_id))
            cursor.close()

            # Log activity
            self.log_activity(user_id, f"Removed {item['item_type']} '{item['title']}' from wishlist")

            return make_response({"message": "Item removed from wishlist successfully"}, 200)

        except Exception as e:
            print(f"Error removing from wishlist: {e}")
            import traceback
            traceback.print_exc()
            return make_response({"error": f"Failed to remove from wishlist: {str(e)}"}, 500)

    def clear_wishlist(self, user_id, item_type=None):
        """Clear user's wishlist (optionally by type)"""
        if not self.conn:
            return make_response({"error": "Database connection not established"}, 500)

        try:
            cursor = self.conn.cursor()

            if item_type:
                query = "DELETE FROM sm_wishlist WHERE user_id = %s AND item_type = %s"
                cursor.execute(query, (user_id, item_type))
                action = f"Cleared all {item_type}s from wishlist"
            else:
                query = "DELETE FROM sm_wishlist WHERE user_id = %s"
                cursor.execute(query, (user_id,))
                action = "Cleared entire wishlist"

            deleted_count = cursor.rowcount
            cursor.close()

            # Log activity
            self.log_activity(user_id, action)

            return make_response({
                "message": f"Wishlist cleared successfully",
                "deleted_count": deleted_count
            }, 200)

        except Exception as e:
            print(f"Error clearing wishlist: {e}")
            import traceback
            traceback.print_exc()
            return make_response({"error": f"Failed to clear wishlist: {str(e)}"}, 500)

    def get_user_activity(self, user_id, limit=50):
        """Get user's activity log"""
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

            # Convert timestamps to ISO format
            for activity in activities:
                if activity['timestamp']:
                    activity['timestamp'] = activity['timestamp'].isoformat()

            return make_response({
                "activities": activities,
                "count": len(activities)
            }, 200)

        except Exception as e:
            print(f"Error fetching user activity: {e}")
            import traceback
            traceback.print_exc()
            return make_response({"error": f"Failed to fetch activity: {str(e)}"}, 500)