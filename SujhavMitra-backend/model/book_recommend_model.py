from flask import make_response
import difflib
import pickle

class BookRecommendModel:
    def __init__(self):
        with open("models/books.pkl", "rb") as f:
            self.books = pickle.load(f)
        with open("models/popular_books_df.pkl", "rb") as f:
            self.popbooks = pickle.load(f)
        with open("models/similarity_scores.pkl", "rb") as f:
            self.similarity = pickle.load(f)
        with open("models/book_user_matrix.pkl", "rb") as f:
            self.book_user_matrix = pickle.load(f)

        # Normalize titles for lookup
        self.book_index_titles = list(self.book_user_matrix.index.str.lower().str.strip())

    def get_popular_book_title(self):
        popular_titles = self.popbooks["Book-Title"].unique()[:15]
        popular_books_info = []
        
        for title in popular_titles:
            book_info = self.books[self.books["Book-Title"] == title].drop_duplicates("Book-Title")
            pop_info = self.popbooks[self.popbooks["Book-Title"] == title]

            if not book_info.empty and not pop_info.empty:
                popular_books_info.append({
                    "title": book_info["Book-Title"].values[0],
                    "author": book_info["Book-Author"].values[0],
                    "isbn": book_info["ISBN"].values[0],
                    "publishdate": book_info["Year-Of-Publication"].values[0],
                    "publisher": book_info["Publisher"].values[0],
                    "imageurl": book_info["Image-URL-L"].values[0],
                    "num_rating": int(pop_info["num_rating"].values[0]),
                    "avg_rating": round(float(pop_info["avg_rating"].values[0]), 2)
                })

        return make_response({"popular_books": popular_books_info}, 200)

    def book_recommend_model(self, title):
        norm_title = title.strip().lower()

        # Exact match first
        if norm_title in self.book_index_titles:
            book_index = self.book_index_titles.index(norm_title)
        else:
            # Try substring match
            substring_matches = [i for i, t in enumerate(self.book_index_titles) if norm_title in t]
            if substring_matches:
                book_index = substring_matches[0]
            else:
                # Fuzzy match using difflib
                close = difflib.get_close_matches(norm_title, self.book_index_titles, n=1, cutoff=0.6)
                if close:
                    book_index = self.book_index_titles.index(close[0])
                else:
                    return make_response({"error": f"Book titled '{title}' not found"}, 404)

        distances = self.similarity[book_index]
        book_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:6]

        recommendations = []
        for i in book_list:
            similar_title = self.book_user_matrix.index[i[0]]
            similarity_score = i[1] * 100  # Convert to percentage

            # Find full book info (title, author, ISBN) — drop duplicates to avoid multiple editions
            book_info = self.books[self.books["Book-Title"] == similar_title].drop_duplicates("Book-Title")

            if not book_info.empty:
                recommendations.append({
                    "title": book_info["Book-Title"].values[0],
                    "author": book_info["Book-Author"].values[0],
                    "isbn": book_info["ISBN"].values[0],
                    "publishdate": book_info["Year-Of-Publication"].values[0],
                    "publisher": book_info["Publisher"].values[0],
                    "imageurl": book_info["Image-URL-L"].values[0],
                    "similarity_score": f"{similarity_score:.2f} %"  # 2 decimal percentage
                })

        return make_response({"recommendations": recommendations}, 200)

    
    def get_book_by_isbn(self, isbn):
        norm_isbn = str(isbn).strip()
        book_info = self.books[self.books["ISBN"].astype(str).str.strip() == norm_isbn].drop_duplicates("Book-Title")
        if book_info.empty:
            return make_response({"error": "Book not found"}, 404)

        book = {
            "title": book_info["Book-Title"].values[0],
            "author": book_info["Book-Author"].values[0],
            "isbn": book_info["ISBN"].values[0],
            "publishdate": book_info["Year-Of-Publication"].values[0],
            "publisher": book_info["Publisher"].values[0],
            "imageurl": book_info["Image-URL-L"].values[0]
        }

        return make_response(book, 200)

    def get_book_by_title(self, title: str):
        if not title:
            return make_response({"error": "Title is required"}, 400)

        norm_title = str(title).strip().lower()

        # Exact match against index titles
        if norm_title in self.book_index_titles:
            idx = self.book_index_titles.index(norm_title)
        else:
            # Substring match in index titles
            matches = [i for i, t in enumerate(self.book_index_titles) if norm_title in t]
            if matches:
                idx = matches[0]
            else:
                # Fuzzy match
                close = difflib.get_close_matches(norm_title, self.book_index_titles, n=1, cutoff=0.6)
                if close:
                    idx = self.book_index_titles.index(close[0])
                else:
                    return make_response({"error": "Book not found"}, 404)

        resolved_title = self.book_user_matrix.index[idx]
        book_info = self.books[self.books["Book-Title"] == resolved_title].drop_duplicates("Book-Title")
        if book_info.empty:
            return make_response({"error": "Book not found"}, 404)

        book = {
            "title": book_info["Book-Title"].values[0],
            "author": book_info["Book-Author"].values[0],
            "isbn": book_info["ISBN"].values[0],
            "publishdate": book_info["Year-Of-Publication"].values[0],
            "publisher": book_info["Publisher"].values[0],
            "imageurl": book_info["Image-URL-L"].values[0]
        }

        return make_response(book, 200)