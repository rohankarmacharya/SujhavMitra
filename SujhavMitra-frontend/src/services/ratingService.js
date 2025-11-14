import axios from "axios";
import { API_BASE } from "./api";

/**
 * Rating Service
 * Handles all rating and recommendation API calls
 */

// Helper to get auth headers
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

/**
 * Add or update a rating
 * @param {string} token - JWT token
 * @param {string} isbn - Book ISBN
 * @param {string} bookTitle - Book title
 * @param {number} rating - Rating (1-10)
 */
export const addRating = async (token, isbn, bookTitle, rating) => {
  try {
    const res = await axios.post(
      `${API_BASE}/rating/add`,
      {
        isbn,
        book_title: bookTitle,
        rating: parseInt(rating),
      },
      getAuthHeaders(token)
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error adding rating:", err);
    return {
      success: false,
      error: err.response?.data?.error || "Failed to add rating",
    };
  }
};

/**
 * Get all ratings for the logged-in user
 * @param {string} token - JWT token
 */
export const getMyRatings = async (token) => {
  try {
    const res = await axios.get(
      `${API_BASE}/rating/my-ratings`,
      getAuthHeaders(token)
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error fetching ratings:", err);
    return {
      success: false,
      error: err.response?.data?.error || "Failed to fetch ratings",
    };
  }
};

/**
 * Update an existing rating
 * @param {string} token - JWT token
 * @param {number} ratingId - Rating ID to update
 * @param {number} newRating - New rating value (1-10)
 */
export const updateRating = async (token, ratingId, newRating) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/rating/update/${ratingId}`,
      { rating: parseInt(newRating) },
      getAuthHeaders(token)
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error updating rating:", err);
    return {
      success: false,
      error: err.response?.data?.error || "Failed to update rating",
    };
  }
};

/**
 * Delete a rating
 * @param {string} token - JWT token
 * @param {number} ratingId - Rating ID to delete
 */
export const deleteRating = async (token, ratingId) => {
  try {
    const res = await axios.delete(
      `${API_BASE}/rating/delete/${ratingId}`,
      getAuthHeaders(token)
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error deleting rating:", err);
    return {
      success: false,
      error: err.response?.data?.error || "Failed to delete rating",
    };
  }
};

/**
 * Get personalized recommendations for the logged-in user
 * @param {string} token - JWT token
 * @param {number} limit - Number of recommendations to fetch (default: 10)
 */
export const getMyRecommendations = async (token, limit = 10) => {
  try {
    const res = await axios.get(
      `${API_BASE}/recommend/my-recommendations?limit=${limit}`,
      getAuthHeaders(token)
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return {
      success: false,
      error: err.response?.data?.error || "Failed to fetch recommendations",
    };
  }
};

/**
 * Check if user has rated a specific book
 * @param {string} token - JWT token
 * @param {string} isbn - Book ISBN
 */
export const getUserRatingForBook = async (token, isbn) => {
  try {
    const result = await getMyRatings(token);
    if (!result.success) return null;

    const ratings = result.data.ratings || [];
    const bookRating = ratings.find((r) => r.isbn === isbn);
    return bookRating || null;
  } catch (err) {
    console.error("Error checking book rating:", err);
    return null;
  }
};
