import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import {
  addRating,
  getUserRatingForBook,
  updateRating,
  deleteRating,
} from "../services/ratingService";
import RatingModal from "./RatingModal";

/**
 * Rating Button Component
 * Shows user's rating or allows them to rate a book
 */
const RatingButton = ({ book, onRatingChange }) => {
  const { user, token } = useAuth();
  const [existingRating, setExistingRating] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Check if user has already rated this book
  useEffect(() => {
    const checkRating = async () => {
      if (!token || !book.isbn) {
        setLoading(false);
        return;
      }

      const rating = await getUserRatingForBook(token, book.isbn);
      setExistingRating(rating);
      setLoading(false);
    };

    checkRating();
  }, [token, book.isbn]);

  const handleSubmitRating = async (ratingValue) => {
    if (!token) {
      alert("Please login to rate books");
      return;
    }

    let result;
    if (existingRating) {
      // Update existing rating
      result = await updateRating(token, existingRating.id, ratingValue);
    } else {
      // Add new rating
      result = await addRating(token, book.isbn, book.title, ratingValue);
    }

    if (result.success) {
      // Refresh the rating
      const updatedRating = await getUserRatingForBook(token, book.isbn);
      setExistingRating(updatedRating);
      setShowModal(false);

      // Notify parent component
      if (onRatingChange) {
        onRatingChange(updatedRating);
      }
    } else {
      alert(result.error || "Failed to save rating");
    }
  };

  const handleDeleteRating = async () => {
    if (!existingRating || !token) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this rating?"
    );
    if (!confirmed) return;

    const result = await deleteRating(token, existingRating.id);
    if (result.success) {
      setExistingRating(null);
      setShowMenu(false);

      // Notify parent component
      if (onRatingChange) {
        onRatingChange(null);
      }
    } else {
      alert(result.error || "Failed to delete rating");
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => alert("Please login to rate books")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg
          className="w-5 h-5"
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
        <span>Rate</span>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-5 w-20 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {existingRating ? (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-medium">{existingRating.rating}/10</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Update Rating
                </button>
                <button
                  onClick={handleDeleteRating}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Rating
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span>Rate Book</span>
        </button>
      )}

      {showModal && (
        <RatingModal
          book={book}
          existingRating={existingRating}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitRating}
        />
      )}
    </>
  );
};

export default RatingButton;
