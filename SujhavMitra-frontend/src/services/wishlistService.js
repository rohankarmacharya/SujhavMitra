import axios from "axios";
import { API_BASE } from "./api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  crossDomain: true,
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure credentials are included in all requests
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login or refresh token)
        console.error("Authentication required");
        // Optionally redirect to login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Get auth token from localStorage with validation
const getAuthToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found");
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return token || "";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return "";
  }
};

/**
 * Add item to wishlist
 * @param {string} itemType - 'book' or 'movie'
 * @param {string|number} itemId - The ID of the item
 * @param {Object} itemData - The complete item data
 * @returns {Promise<Object>} The response data
 */
export const addToWishlist = async (itemType, itemId, itemData) => {
  try {
    // Common fields for all items
    const commonFields = {
      item_type: itemType,
      item_id: String(itemId),
      title: itemData?.title || itemData?.name || "Untitled",
      description: itemData?.description || itemData?.overview || "",
      image:
        itemData?.poster_path ||
        itemData?.cover_image ||
        itemData?.image ||
        null,
      genres: Array.isArray(itemData?.genres)
        ? itemData.genres.join(",")
        : typeof itemData?.genres === "string"
        ? itemData.genres
        : "",
    };

    // Type-specific fields
    const typeSpecificFields =
      itemType === "book"
        ? {
            isbn: String(itemId),
            author:
              itemData?.author || itemData?.authors?.[0] || "Unknown Author",
            description: itemData?.description || itemData?.overview || "",
            cover_image: itemData?.cover_image || itemData?.image || null,
            pageCount: itemData?.pageCount || itemData?.page_count || null,
            publishedDate:
              itemData?.publishedDate || itemData?.published_date || null,
            publisher: itemData?.publisher || null,
          }
        : {
            // Movie-specific fields
            id: String(itemId),
            release_date: itemData?.release_date || itemData?.year || null,
            vote_average: itemData?.vote_average || itemData?.rating || null,
            vote_count: itemData?.vote_count || 0,
            cast: Array.isArray(itemData?.cast)
              ? itemData.cast.join(", ")
              : typeof itemData?.cast === "string"
              ? itemData.cast
              : "",
            crew: itemData?.crew || "",
            poster_path: itemData?.poster_path || itemData?.image || null,
            genres: Array.isArray(itemData?.genres)
              ? itemData.genres.join(",")
              : typeof itemData?.genres === "string"
              ? itemData.genres
              : "",
          };

    // Combine all data
    const wishlistData = {
      ...commonFields,
      ...typeSpecificFields,
      // Include any additional fields from the original data
      ...itemData,
    };

    // Clean up any undefined or null values to avoid sending them
    Object.keys(wishlistData).forEach((key) => {
      if (wishlistData[key] === undefined || wishlistData[key] === null) {
        delete wishlistData[key];
      }
    });

    console.log("Sending to wishlist:", wishlistData);
    const response = await api.post("/wishlist/add", wishlistData);

    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return {
      success: false,
      data: null,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to add to wishlist",
    };
  }
};

/**
 * Remove item from wishlist
 * @param {string|number} wishlistId - The ID of the wishlist item
 * @returns {Promise<Object>} The response data
 */
export const removeFromWishlist = async (wishlistId) => {
  try {
    const response = await api.delete(`/wishlist/remove/${wishlistId}`);
    return {
      success: true,
      data: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.error || "Failed to remove from wishlist",
    };
  }
};

/**
 * Get user's wishlist
 * @param {string} [itemType] - Optional filter for item type ('book' or 'movie')
 * @returns {Promise<{success: boolean, data: Array, error: string|null, count: number}>} Wishlist response
 */
export const getWishlist = async (itemType = null) => {
  try {
    const params = itemType ? { type: itemType } : {};
    const response = await api.get("/wishlist", { params });

    // Ensure we always return an array
    const items = response.data?.wishlist || [];
    return {
      success: true,
      data: Array.isArray(items) ? items : [],
      error: null,
      count: response.data?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.error || "Failed to fetch wishlist",
      count: 0,
    };
  }
};
