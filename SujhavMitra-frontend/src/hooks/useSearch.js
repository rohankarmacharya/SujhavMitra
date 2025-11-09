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
        const data = await fetchRecommendations(q);

        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data);
          if (!data.length) {
            setError("No recommendations found. Try a different search term.");
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
    [query, fetchRecommendations, onError]
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
