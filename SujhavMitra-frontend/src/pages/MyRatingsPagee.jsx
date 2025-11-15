import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import {
  getMyRatings,
  deleteRating,
  updateRating,
} from "../services/ratingService";
import { resolvePosterUrl } from "../services/api";
import RatingModal from "../components/RatingModal";

const MyRatingsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetchRatings();
  }, [user, token, navigate]);

  const fetchRatings = async () => {
    setLoading(true);
    const result = await getMyRatings(token);
    if (result.success) {
      setRatings(result.data.ratings || []);
    }
    setLoading(false);
  };

  const handleUpdateRating = async (newRating) => {
    if (!editingBook) return;

    const result = await updateRating(token, editingBook.id, newRating);
    if (result.success) {
      await fetchRatings();
      setEditingBook(null);
    } else {
      alert(result.error || "Failed to update rating");
    }
  };

  const handleDeleteRating = async (ratingId, bookTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete your rating for "${bookTitle}"?`
    );
    if (!confirmed) return;

    const result = await deleteRating(token, ratingId);
    if (result.success) {
      await fetchRatings();
    } else {
      alert(result.error || "Failed to delete rating");
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "text-green-600 bg-green-100";
    if (rating >= 6) return "text-blue-600 bg-blue-100";
    if (rating >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getRatingLabel = (rating) => {
    if (rating >= 9) return "Excellent";
    if (rating >= 7) return "Good";
    if (rating >= 5) return "Average";
    if (rating >= 3) return "Poor";
    return "Very Poor";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Ratings</h1>
          <p className="text-gray-600">
            You've rated {ratings.length}{" "}
            {ratings.length === 1 ? "book" : "books"}
          </p>
        </div>

        {/* Empty State */}
        {ratings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No ratings yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start rating books to get personalized recommendations!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Discover Books
            </button>
          </div>
        ) : (
          /* Ratings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Book Image */}
                <div className="relative h-64 bg-gray-200">
                  <img
                    src={resolvePosterUrl(rating.imageurl)}
                    alt={rating.book_title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-book.png";
                    }}
                  />
                  {/* Rating Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full font-bold ${getRatingColor(
                      rating.rating
                    )}`}
                  >
                    {rating.rating}/10
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {rating.book_title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{rating.author}</p>

                  {/* Rating Label */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(10)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {getRatingLabel(rating.rating)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-4">
                    <div>
                      Rated: {new Date(rating.created_at).toLocaleDateString()}
                    </div>
                    {rating.updated_at !== rating.created_at && (
                      <div>
                        Updated:{" "}
                        {new Date(rating.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingBook({
                          id: rating.id,
                          title: rating.book_title,
                          author: rating.author,
                          isbn: rating.isbn,
                          rating: rating.rating,
                        })
                      }
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteRating(rating.id, rating.book_title)
                      }
                      className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Get Recommendations Button */}
        {ratings.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/recommendations")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              ✨ Get Personalized Recommendations
            </button>
          </div>
        )}
      </div>

      {/* Edit Rating Modal */}
      {editingBook && (
        <RatingModal
          book={editingBook}
          existingRating={editingBook}
          onClose={() => setEditingBook(null)}
          onSubmit={handleUpdateRating}
        />
      )}
    </div>
  );
};

export default MyRatingsPage;
