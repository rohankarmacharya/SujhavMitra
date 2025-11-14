from flask import make_response, jsonify
import mysql.connector
from configs.config import dbconfig
from mysql.connector import Error
import pickle
import numpy as np
from collections import defaultdict

class RatingModel:
    def __init__(self):
        # Load the collaborative filtering model components
        with open("models/books.pkl", "rb") as f:
            self.books = pickle.load(f)
        with open("models/similarity_scores.pkl", "rb") as f:
            self.similarity = pickle.load(f)
        with open("models/book_user_matrix.pkl", "rb") as f:
            self.book_user_matrix = pickle.load(f)
        
        # Normalize titles for lookup
        self.book_index_titles = list(self.book_user_matrix.index.str.lower().str.strip())
        
    def get_db_connection(self):
        """Create database connection"""
        try:
            connection = mysql.connector.connect(
                host=dbconfig["host"],
                port=dbconfig["port"],
                user=dbconfig["user"],
                password=dbconfig["password"],
                database=dbconfig["database"],
            )
            return connection
        except Error as e:
            print(f"Error connecting to database: {e}")
            return None

    def add_rating(self, user_id, isbn, book_title, rating):
        """Add or update a user's rating for a book"""
        connection = self.get_db_connection()
        if not connection:
            return make_response({"error": "Database connection failed"}, 500)
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Check if user exists
            cursor.execute("SELECT id FROM sm_users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return make_response({"error": "User not found"}, 404)
            
            # Check if rating already exists
            cursor.execute(
                "SELECT id FROM sm_user_ratings WHERE user_id = %s AND isbn = %s",
                (user_id, isbn)
            )
            existing_rating = cursor.fetchone()
            
            if existing_rating:
                # Update existing rating
                cursor.execute(
                    """UPDATE sm_user_ratings 
                       SET rating = %s, book_title = %s, updated_at = CURRENT_TIMESTAMP 
                       WHERE id = %s""",
                    (rating, book_title, existing_rating['id'])
                )
                message = "Rating updated successfully"
                rating_id = existing_rating['id']
            else:
                # Insert new rating
                cursor.execute(
                    """INSERT INTO sm_user_ratings (user_id, isbn, book_title, rating) 
                       VALUES (%s, %s, %s, %s)""",
                    (user_id, isbn, book_title, rating)
                )
                rating_id = cursor.lastrowid
                message = "Rating added successfully"
                
                # Log activity
                cursor.execute(
                    """INSERT INTO sm_user_activity (user_id, action) 
                       VALUES (%s, %s)""",
                    (user_id, f"Rated book '{book_title}' with {rating}/10")
                )
            
            connection.commit()
            
            return make_response({
                "message": message,
                "rating_id": rating_id,
                "user_id": user_id,
                "isbn": isbn,
                "book_title": book_title,
                "rating": rating
            }, 200)
            
        except Error as e:
            connection.rollback()
            return make_response({"error": f"Database error: {str(e)}"}, 500)
        finally:
            cursor.close()
            connection.close()

    def get_user_ratings(self, user_id):
        """Get all ratings by a specific user"""
        connection = self.get_db_connection()
        if not connection:
            return make_response({"error": "Database connection failed"}, 500)
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute(
                """SELECT id, isbn, book_title, rating, created_at, updated_at
                   FROM sm_user_ratings
                   WHERE user_id = %s
                   ORDER BY updated_at DESC""",
                (user_id,)
            )
            
            ratings = cursor.fetchall()
            
            # Enrich with book data from pickle file
            for rating in ratings:
                isbn = rating['isbn']
                book_info = self.books[self.books["ISBN"].astype(str).str.strip() == str(isbn).strip()]
                
                if not book_info.empty:
                    rating['author'] = book_info["Book-Author"].values[0]
                    rating['publisher'] = book_info["Publisher"].values[0]
                    rating['publishdate'] = int(book_info["Year-Of-Publication"].values[0])
                    rating['imageurl'] = book_info["Image-URL-L"].values[0]
                else:
                    rating['author'] = None
                    rating['publisher'] = None
                    rating['publishdate'] = None
                    rating['imageurl'] = None
                
                # Convert datetime to string for JSON serialization
                rating['created_at'] = str(rating['created_at'])
                rating['updated_at'] = str(rating['updated_at'])
            
            return make_response({
                "user_id": user_id,
                "ratings": ratings,
                "count": len(ratings)
            }, 200)
            
        except Error as e:
            return make_response({"error": f"Database error: {str(e)}"}, 500)
        finally:
            cursor.close()
            connection.close()

    def update_rating(self, rating_id, new_rating, user_id):
        """Update an existing rating (with ownership verification)"""
        connection = self.get_db_connection()
        if not connection:
            return make_response({"error": "Database connection failed"}, 500)
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Check if rating exists and belongs to user
            cursor.execute(
                "SELECT * FROM sm_user_ratings WHERE id = %s",
                (rating_id,)
            )
            rating = cursor.fetchone()
            
            if not rating:
                return make_response({"error": "Rating not found"}, 404)
            
            # Verify ownership
            if rating['user_id'] != user_id:
                return make_response({"error": "You can only update your own ratings"}, 403)
            
            # Update rating
            cursor.execute(
                """UPDATE sm_user_ratings 
                   SET rating = %s, updated_at = CURRENT_TIMESTAMP 
                   WHERE id = %s""",
                (new_rating, rating_id)
            )
            
            # Log activity
            cursor.execute(
                """INSERT INTO sm_user_activity (user_id, action) 
                   VALUES (%s, %s)""",
                (rating['user_id'], f"Updated rating for '{rating['book_title']}' to {new_rating}/10")
            )
            
            connection.commit()
            
            return make_response({
                "message": "Rating updated successfully",
                "rating_id": rating_id,
                "new_rating": new_rating
            }, 200)
            
        except Error as e:
            connection.rollback()
            return make_response({"error": f"Database error: {str(e)}"}, 500)
        finally:
            cursor.close()
            connection.close()

    def delete_rating(self, rating_id, user_id):
        """Delete a rating (with ownership verification)"""
        connection = self.get_db_connection()
        if not connection:
            return make_response({"error": "Database connection failed"}, 500)
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get rating info before deletion
            cursor.execute("SELECT * FROM sm_user_ratings WHERE id = %s", (rating_id,))
            rating = cursor.fetchone()
            
            if not rating:
                return make_response({"error": "Rating not found"}, 404)
            
            # Verify ownership
            if rating['user_id'] != user_id:
                return make_response({"error": "You can only delete your own ratings"}, 403)
            
            # Delete rating
            cursor.execute("DELETE FROM sm_user_ratings WHERE id = %s", (rating_id,))
            
            # Log activity
            cursor.execute(
                """INSERT INTO sm_user_activity (user_id, action) 
                   VALUES (%s, %s)""",
                (rating['user_id'], f"Deleted rating for '{rating['book_title']}'")
            )
            
            connection.commit()
            
            return make_response({
                "message": "Rating deleted successfully",
                "rating_id": rating_id
            }, 200)
            
        except Error as e:
            connection.rollback()
            return make_response({"error": f"Database error: {str(e)}"}, 500)
        finally:
            cursor.close()
            connection.close()

    def get_recommendations_for_user(self, user_id, limit=10):
        """Get book recommendations based on user's ratings using collaborative filtering"""
        connection = self.get_db_connection()
        if not connection:
            return make_response({"error": "Database connection failed"}, 500)
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get user's ratings
            cursor.execute(
                "SELECT book_title, rating FROM sm_user_ratings WHERE user_id = %s",
                (user_id,)
            )
            user_ratings = cursor.fetchall()
            
            if not user_ratings:
                return make_response({
                    "message": "No ratings found for this user. Please rate some books first.",
                    "user_id": user_id,
                    "recommendations": []
                }, 200)
            
            # Calculate recommendations based on similarity scores
            recommendation_scores = defaultdict(float)
            book_counts = defaultdict(int)
            book_sources = defaultdict(list)  # Track which books contributed to each recommendation
            rated_books = set()
            
            for rated_book in user_ratings:
                title = rated_book['book_title']
                user_rating = rated_book['rating']
                rated_books.add(title.lower().strip())
                
                # Find this book in the model
                norm_title = title.lower().strip()
                if norm_title not in self.book_index_titles:
                    continue
                
                book_index = self.book_index_titles.index(norm_title)
                
                # Get similar books
                distances = self.similarity[book_index]
                similar_books = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:21]
                
                # Apply exponential weighting to emphasize high ratings and suppress low ones
                # This makes 4/10 have much less influence than 7/10
                normalized_rating = user_rating / 10.0
                exponential_weight = normalized_rating ** 2  # Square it for exponential effect
                # 4/10 → 0.4² = 0.16 (much weaker)
                # 7/10 → 0.7² = 0.49
                # 9/10 → 0.9² = 0.81
                
                # Accumulate scores weighted by user's rating
                for idx, similarity_score in similar_books:
                    similar_title = self.book_user_matrix.index[idx]
                    if similar_title.lower().strip() not in rated_books:
                        # Use exponential weighting instead of linear
                        weighted_score = similarity_score * exponential_weight
                        recommendation_scores[similar_title] += weighted_score
                        book_counts[similar_title] += 1
                        
                        # Track the source and similarity
                        book_sources[similar_title].append({
                            'source_book': title,
                            'user_rating': user_rating,
                            'similarity': similarity_score,
                            'weighted_contribution': weighted_score
                        })
            
            # Calculate average scores and sort
            recommendations = []
            for book_title, total_score in recommendation_scores.items():
                avg_score = total_score / book_counts[book_title]
                recommendations.append((book_title, avg_score, book_sources[book_title]))
            
            recommendations.sort(key=lambda x: x[1], reverse=True)
            recommendations = recommendations[:limit]
            
            # Get full book information
            result = []
            for book_title, score, sources in recommendations:
                book_info = self.books[self.books["Book-Title"] == book_title].drop_duplicates("Book-Title")
                
                if not book_info.empty:
                    # Format the sources to show why this book was recommended
                    similar_to = []
                    for source in sorted(sources, key=lambda x: x['weighted_contribution'], reverse=True)[:3]:  # Top 3 sources
                        similar_to.append({
                            'book': source['source_book'],
                            'your_rating': f"{source['user_rating']}/10",
                            'similarity': f"{source['similarity'] * 100:.1f}%",
                            'contribution': f"{source['weighted_contribution'] * 100:.1f}%"
                        })
                    
                    result.append({
                        "title": book_info["Book-Title"].values[0],
                        "author": book_info["Book-Author"].values[0],
                        "isbn": book_info["ISBN"].values[0],
                        "publishdate": book_info["Year-Of-Publication"].values[0],
                        "publisher": book_info["Publisher"].values[0],
                        "imageurl": book_info["Image-URL-L"].values[0],
                        "recommendation_score": f"{score * 100:.2f}%",
                        "similar_to": similar_to
                    })
            
            # Log activity
            cursor.execute(
                """INSERT INTO sm_user_activity (user_id, action) 
                   VALUES (%s, %s)""",
                (user_id, "Viewed personalized recommendations")
            )
            connection.commit()
            
            return make_response({
                "user_id": user_id,
                "based_on_ratings": len(user_ratings),
                "recommendations": result
            }, 200)
            
        except Error as e:
            return make_response({"error": f"Database error: {str(e)}"}, 500)
        finally:
            cursor.close()
            connection.close()