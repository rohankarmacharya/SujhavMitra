import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { getMyRecommendations } from "../services/ratingService";
import { resolvePosterUrl } from "../services/api";

const RecommendationsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [basedOnRatings, setBasedOnRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [expandedBook, setExpandedBook] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetchRecommendations();
  }, [user, token, navigate, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    const result = await getMyRecommendations(token, limit);
    if (result.success) {
      setRecommendations(result.data.recommendations || []);
      setBasedOnRatings(result.data.based_on_ratings || 0);
    } else {
      if (result.error?.includes("No ratings found")) {
        // User hasn't rated any books yet
        setRecommendations([]);
        setBasedOnRatings(0);
      }
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 50) return "text-green-600 bg-green-100";
    if (numScore >= 30) return "text-blue-600 bg-blue-100";
    if (numScore >= 15) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding perfect books for you...</p>
        </div>
      </div>
    );
  }

  // No ratings yet
  if (basedOnRatings === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-20 h-20 mx-auto text-blue-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Recommendations Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Rate at least 3-5 books to get personalized recommendations based
              on your taste!
            </p>
            <button
              onClick={() => navigate("/my-ratings")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
            >
              Go to My Ratings
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ✨ Recommendations For You
              </h1>
              <p className="text-gray-600">
                Based on {basedOnRatings} books you've rated
              </p>
            </div>
            <button
              onClick={() => navigate("/my-ratings")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View My Ratings
            </button>
          </div>

          {/* Limit Selector */}
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Show:</span>
            {[10, 20, 30].map((num) => (
              <button
                key={num}
                onClick={() => setLimit(num)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  limit === num
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((book, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm z-10">
                  #{index + 1}
                </div>

                {/* Book Image */}
                <div className="h-72 bg-gray-200">
                  <img
                    src={resolvePosterUrl(book.imageurl)}
                    alt={book.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-book.png";
                    }}
                  />
                </div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                {/* Recommendation Score */}
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${getScoreColor(
                    book.recommendation_score
                  )}`}
                >
                  {book.recommendation_score} Match
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{book.author}</p>

                {/* Similar To Preview */}
                {book.similar_to && book.similar_to.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Similar to:</p>
                    <p className="text-xs font-medium text-blue-600 line-clamp-1">
                      {book.similar_to[0].book} (
                      {book.similar_to[0].your_rating})
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setExpandedBook(expandedBook === index ? null : index)
                    }
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {expandedBook === index ? "Hide Details" : "Why This?"}
                  </button>
                  <button
                    onClick={() => navigate(`/book/${book.isbn}`)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedBook === index && book.similar_to && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Recommended because:
                    </p>
                    <div className="space-y-2">
                      {book.similar_to.map((source, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded p-2 text-xs"
                        >
                          <div className="font-medium text-gray-900 mb-1">
                            {source.book}
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>You rated: {source.your_rating}</span>
                            <span>Similarity: {source.similarity}</span>
                          </div>
                          <div className="text-blue-600 font-medium mt-1">
                            Contribution: {source.contribution}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 How Recommendations Work
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Books you rate <strong>highly (8-10)</strong> have the most
              influence
            </li>
            <li>
              • Books you rate <strong>moderately (5-7)</strong> have normal
              influence
            </li>
            <li>
              • Books you rate <strong>poorly (1-4)</strong> have minimal
              influence
            </li>
            <li>
              • The more books you rate, the better your recommendations become!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
