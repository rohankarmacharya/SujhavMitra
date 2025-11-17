import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import RatingModal from "../../components/RatingModal";
import { getMyRatings, deleteRating } from "../../services/ratingService";
import { showToast } from "../../utils/toast";
import SectionHeader from "../../components/SectionHeader";
import Skeleton from "../../components/Skeleton";

export default function MyRatingsTab({ onSwitchTab }) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchRatings();
    }
  }, [user, token]);

  const fetchRatings = async () => {
    setLoading(true);
    const result = await getMyRatings(token);
    if (result.success) {
      setRatings(result.data.ratings || []);
    }
    setLoading(false);
  };

  const handleDeleteRating = async (ratingId, bookTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete your rating for "${bookTitle}"?`
    );
    if (!confirmed) return;

    const result = await deleteRating(token, ratingId);
    if (result.success) {
      await fetchRatings();
      showToast("Rating deleted");
    } else {
      alert(result.error || "Failed to delete rating");
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "text-green-600 bg-green-100";
    if (rating >= 6) return "text-[#4fb4ce] bg-blue-100";
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

  if (!user || !token) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to view your ratings
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-[#4fb4ce] text-white rounded-lg hover:bg-[#837fcb] transition-colors"
            >
              Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <Skeleton />;
  }

  if (ratings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardContent className="p-12 text-center">
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
              onClick={() => onSwitchTab("discover")}
              className="px-6 py-3 bg-[#4fb4ce] text-white rounded-lg hover:bg-[#837fcb] transition-colors"
            >
              Discover Books
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-6 mb-6">
          <SectionHeader
            title="My Ratings"
            description={`You've rated ${ratings.length}  ${
              ratings.length === 1 ? "book" : "books"
            }`}
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2"></h2>
          <p className="text-gray-600">
            You've rated {ratings.length}{" "}
            {ratings.length === 1 ? "book" : "books"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-64 bg-gray-200">
                <img
                  src={rating.imageurl}
                  alt={rating.book_title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/placeholder-book.png";
                  }}
                />
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full font-bold ${getRatingColor(
                    rating.rating
                  )}`}
                >
                  {rating.rating}/10
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {rating.book_title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{rating.author}</p>

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

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDeleteRating(rating.id, rating.book_title)
                    }
                    className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete Rating
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ratings.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => onSwitchTab("recommendations")}
              className="px-8 py-4 bg-gradient-to-r from-[#4fb4ce] to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-[#837fcb] hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Get Recommendations
            </button>
          </div>
        )}
      </div>
    </>
  );
}
