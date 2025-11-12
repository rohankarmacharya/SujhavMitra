import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook to handle search logic with suggestions
 * Reduces duplication between Books and Movies pages
 */
export default function useSearch({
  fetchRecommendations,
  fetchPopularItems,
  onError,
  onSearchComplete, // New callback for when search completes
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const handleSearch = useCallback(
    async (searchQuery) => {
      const q = (searchQuery || query).trim();
      if (!q) {
        setError("Please enter a search term.");
        return;
      }

      setError(null);
      setLoading(true);
      setResults([]);

      try {
        // First, try to find the exact movie from popular items
        let searchedMovie = null;

        if (fetchPopularItems) {
          const popularItems = await fetchPopularItems();
          if (Array.isArray(popularItems)) {
            // Try exact match first
            searchedMovie = popularItems.find(
              (item) => item.title?.toLowerCase() === q.toLowerCase()
            );

            // If no exact match, try partial match
            if (!searchedMovie) {
              searchedMovie = popularItems.find((item) =>
                item.title?.toLowerCase().includes(q.toLowerCase())
              );
            }
          }
        }

        // Then get recommendations
        const data = await fetchRecommendations(q);

        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data);

          // If we didn't find the movie in popular items, try to find it in recommendations
          if (!searchedMovie && Array.isArray(data) && data.length > 0) {
            searchedMovie = data.find(
              (item) => item.title?.toLowerCase() === q.toLowerCase()
            );

            // If still not found, try partial match in recommendations
            if (!searchedMovie) {
              searchedMovie = data.find((item) =>
                item.title?.toLowerCase().includes(q.toLowerCase())
              );
            }
          }

          if (!searchedMovie && (!data || data.length === 0)) {
            setError("No movie found. Try a different search term.");
          } else {
            // Call the completion callback with the searched movie and recommendations
            if (onSearchComplete) {
              onSearchComplete(data, searchedMovie);
            }
          }
        }
      } catch (err) {
        const errorMessage = err.message || String(err);
        setError(`Search failed: ${errorMessage}`);
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    },
    [query, fetchRecommendations, fetchPopularItems, onError, onSearchComplete]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setSuggestions([]);
  }, []);

  const fetchSuggestions = useCallback(
    async (searchTerm) => {
      try {
        const recs = await fetchRecommendations(searchTerm);
        const titles = Array.isArray(recs)
          ? recs.map((item) => item.title).filter(Boolean)
          : [];

        const lowerSearch = searchTerm.toLowerCase();
        let uniqueTitles = Array.from(new Set(titles))
          .filter((title) => title.toLowerCase().startsWith(lowerSearch))
          .slice(0, 8);

        // Fallback to popular items if no backend suggestions
        if (uniqueTitles.length === 0 && fetchPopularItems) {
          const popular = await fetchPopularItems();
          const popularTitles = Array.isArray(popular)
            ? popular
                .map((item) => item.title || item["Book-Title"])
                .filter(Boolean)
            : [];

          uniqueTitles = Array.from(new Set(popularTitles))
            .filter((title) => title.toLowerCase().startsWith(lowerSearch))
            .slice(0, 8);
        }

        setSuggestions(uniqueTitles);
        return uniqueTitles;
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        return [];
      }
    },
    [fetchRecommendations, fetchPopularItems]
  );

  // Handle prefill from navigation state
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "string") {
      setQuery(prefill);
      handleSearch(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    error,
    setError,
    handleSearch,
    handleClear,
    fetchSuggestions,
  };
}
