import React, { useState } from "react";

/**
 * Rating Modal Component
 * Allows users to rate a book on a scale of 1-10
 */
const RatingModal = ({ book, existingRating, onClose, onSubmit }) => {
  const [rating, setRating] = useState(existingRating?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(rating);
    setLoading(false);
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: "Terrible",
      2: "Very Poor",
      3: "Poor",
      4: "Below Average",
      5: "Average",
      6: "Decent",
      7: "Good",
      8: "Great",
      9: "Excellent",
      10: "Masterpiece",
    };
    return labels[value] || "";
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {existingRating ? "Update Rating" : "Rate this Book"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{book.title}</p>
            <p className="text-xs text-gray-500">{book.author}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Rating Display */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {displayRating}/10
          </div>
          <div className="text-lg font-medium text-gray-700">
            {getRatingLabel(displayRating)}
          </div>
        </div>

        {/* Rating Slider */}
        <div className="mb-6">
          <input
            type="range"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            onMouseMove={(e) => {
              const rect = e.target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              const value = Math.round(percent * 9) + 1;
              setHoveredRating(Math.max(1, Math.min(10, value)));
            }}
            onMouseLeave={() => setHoveredRating(null)}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                ((displayRating - 1) / 9) * 100
              }%, #e5e7eb ${((displayRating - 1) / 9) * 100}%, #e5e7eb 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Rating Scale Guide */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Rating Guide:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">9-10:</span> Love it
            </div>
            <div>
              <span className="font-medium">7-8:</span> Really good
            </div>
            <div>
              <span className="font-medium">5-6:</span> It's okay
            </div>
            <div>
              <span className="font-medium">1-4:</span> Didn't like it
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : existingRating ? (
              "Update Rating"
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
