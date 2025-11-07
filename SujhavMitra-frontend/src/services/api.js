import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;
export const POSTER_BASE = import.meta.env.VITE_POSTER_BASE || "";

export const resolvePosterUrl = (value) => {
  if (!value) return undefined;
  const str = String(value);
  if (/^https?:\/\//i.test(str) || str.startsWith("data:")) return str;
  if (!POSTER_BASE) return str; // fallback as-is
  // ensure exactly one slash between base and path
  const base = POSTER_BASE.endsWith("/") ? POSTER_BASE.slice(0, -1) : POSTER_BASE;
  const path = str.startsWith("/") ? str : `/${str}`;
  return `${base}${path}`;
};

// Fetch popular books
export const fetchPopularBooks = async () => {
  try {
    const res = await axios.get(`${API_BASE}/recommend/book`);
    return res.data.popular_books || [];
  } catch (err) {
    console.error("Error fetching popular books:", err);
    return [];
  }
};

// Fetch recommendations for a book title
export const fetchBookRecommendations = async (title) => {
  try {
    const res = await axios.get(
      `${API_BASE}/recommend/book?title=${encodeURIComponent(title)}`
    );
    if (res.data && res.data.error) {
      return { error: res.data.error };
    }
    return res.data.recommendations || [];
  } catch (err) {
    console.error("Error fetching book recommendations:", err);
    return { error: err.message || "Failed to fetch recommendations" };
  }
};

export const fetchBookById = async (identifier) => {
  try {
    const res = await axios.get(`${API_BASE}/book/${identifier}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching book details:", err);
    throw new Error(
      err.response?.data?.message || "Failed to fetch book details"
    );
  }
};

export const fetchBookByTitle = async (title) => {
  try {
    const res = await axios.get(`${API_BASE}/book/by-title`, {
      params: { title },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching book by title:", err);
    throw new Error(err.response?.data?.error || "Failed to fetch book by title");
  }
};

export const fetchPopularMovies = async () => {
  try {
    const res = await axios.get(`${API_BASE}/recommend/movie`);
    return res.data.popular_movie || [];
  } catch (err) {
    console.error("Error fetching popular movies:", err);
    return [];
  }
};

export const fetchMovieRecommendations = async (title) => {
  try {
    const res = await axios.get(
      `${API_BASE}/recommend/movie?title=${encodeURIComponent(title)}`
    );
    return res.data.recommendations || [];
  } catch (err) {
    console.error("Error fetching movie recommendations:", err);
    return { error: err.message || "Failed to fetch recommendations" };
  }
};

export const fetchMovieById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/movie/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching movie by id:", err);
    throw new Error(err.response?.data?.error || "Failed to fetch movie");
  }
};
