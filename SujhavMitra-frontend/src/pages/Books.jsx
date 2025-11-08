import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import BookSlider from "../components/BookSlider";
import RecommendationCard from "../components/RecommendationCard";
import Loading from "../components/Loading";
import { fetchPopularBooks, fetchBookRecommendations } from "../services/api";
import "../index.css";
import SectionHeader from "../components/SectionHeader";
import { showToast } from "../utils/toast";

export default function Books() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const suggRef = useRef(null);
  const suppressSuggestRef = useRef(false);

  // Fetch popular books once
  useEffect(() => {
    const loadPopularBooks = async () => {
      const books = await fetchPopularBooks();
      setPopularBooks(books);
    };
    loadPopularBooks();
  }, []);

  // Toast reminder of current section (once per mount/visit)
  useEffect(() => {
    showToast("You are in Books");
  }, []);

  const clearResults = useCallback(() => {
    setQuery("");
    setRecommendations([]);
    setError(null);
  }, []);

  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const trimmedQuery = (query || "").trim();
      if (!trimmedQuery) {
        setError("Please enter a book title to search.");
        return;
      }

      setSuggestionsOpen(false);
      setSuggestions([]);
      setActiveIdx(-1);
      suppressSuggestRef.current = true;
      setTimeout(() => {
        suppressSuggestRef.current = false;
      }, 400);
      setError(null);
      setRecommendations([]);
      setLoading(true);

      try {
        const recs = await fetchBookRecommendations(trimmedQuery);

        if (recs.error) {
          setError(recs.error);
          setRecommendations([]);
          return;
        }

        setRecommendations(recs);

        if (recs.length === 0) {
          setError(
            "No recommendations found for this title. Try a different search term."
          );
        }
      } catch (err) {
        const errorMessage = err.message || String(err);
        setError(`Search failed: ${errorMessage}`);
        console.error("Book search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const handleInputChange = useCallback(
    (e) => {
      setQuery(e.target.value);
      setActiveIdx(-1);
      if (error) setError(null);
    },
    [error]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!suggestionsOpen || suggestions.length === 0) {
        if (e.key === "Enter" && !loading && query.trim()) handleSearch();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const choice = activeIdx >= 0 ? suggestions[activeIdx] : query.trim();
        if (choice) {
          setQuery(choice);
          setSuggestionsOpen(false);
          handleSearch();
        }
      } else if (e.key === "Escape") {
        setSuggestionsOpen(false);
      }
    },
    [suggestionsOpen, suggestions, activeIdx, loading, query, handleSearch]
  );

  // Backend-powered suggestions with STARTS-WITH matching (debounced)
  useEffect(() => {
    const s = query.trim();
    if (!s) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      if (suppressSuggestRef.current) {
        setSuggestions([]);
        setSuggestionsOpen(false);
        return;
      }
      try {
        const recs = await fetchBookRecommendations(s);
        const titles = Array.isArray(recs)
          ? recs.map((r) => r.title).filter(Boolean)
          : [];
        const low = s.toLowerCase();
        // starts-with from backend recs
        let uniq = Array.from(new Set(titles))
          .filter((tt) => tt.toLowerCase().startsWith(low))
          .slice(0, 8);
        // fallback to popular if backend gives nothing useful (common on 1-letter input)
        if (uniq.length === 0) {
          const list = (
            Array.isArray(popularBooks)
              ? popularBooks
              : popularBooks?.popular_books || []
          )
            .map((b) => b.title || b["Book-Title"]) // normalize
            .filter(Boolean);
          uniq = Array.from(new Set(list))
            .filter((tt) => tt.toLowerCase().startsWith(low))
            .slice(0, 8);
        }
        setSuggestions(uniq);
        setSuggestionsOpen(uniq.length > 0);
        setActiveIdx(-1);
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      const inp = inputRef.current;
      const box = suggRef.current;
      if (!inp && !box) return;
      if (inp && inp.contains(e.target)) return;
      if (box && box.contains(e.target)) return;
      setSuggestionsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Prefill from navigation state (Home quick search)
  useEffect(() => {
    const prefill = location.state?.prefill;
    if (prefill && typeof prefill === "string") {
      setQuery(prefill);
      // perform direct search with prefill string to avoid state timing issues
      (async () => {
        try {
          setError(null);
          setRecommendations([]);
          setLoading(true);
          const recs = await fetchBookRecommendations(prefill.trim());
          if (recs.error) {
            setError(recs.error);
            setRecommendations([]);
          } else {
            setRecommendations(recs);
            if (!recs.length) {
              setError(
                "No recommendations found for this title. Try a different search term."
              );
            }
          }
        } catch (err) {
          const errorMessage = err.message || String(err);
          setError(`Search failed: ${errorMessage}`);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Bookpage pt-10 pb-16">
      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
              <span role="img" aria-label="books">
                📚
              </span>
              You are in Books
            </span>
          </div>
          <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Books
            </h1>
            <p className="text-sm text-black-600 mt-1">
              Search by title to get recommendations powered by your dataset.
            </p>

            <div className="relative flex flex-col sm:flex-row gap-3 mt-5">
              <input
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter book title (e.g. 'The Great Gatsby')"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                ref={inputRef}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen}
                aria-controls="books-sugg-list"
                aria-activedescendant={
                  activeIdx >= 0 ? `book-sugg-${activeIdx}` : undefined
                }
              />
              {/* Suggestions */}
              {suggestionsOpen && suggestions.length > 0 && (
                <div
                  ref={suggRef}
                  className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border bg-white shadow-lg"
                >
                  <ul
                    id="books-sugg-list"
                    role="listbox"
                    className="max-h-64 overflow-auto py-1 text-sm"
                  >
                    {suggestions.map((t, i) => (
                      <li
                        key={`${t}-${i}`}
                        id={`book-sugg-${i}`}
                        role="option"
                        aria-selected={i === activeIdx}
                        className={`cursor-pointer px-3 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          i === activeIdx ? "bg-gray-200" : ""
                        }`}
                        onClick={() => {
                          setQuery(t);
                          setSuggestionsOpen(false);
                          handleSearch();
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={loading || !query.trim()}
                onClick={handleSearch}
              >
                {loading ? "Searching…" : "Search"}
              </button>
              <button
                type="button"
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={clearResults}
                disabled={loading}
              >
                Clear
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-medium">Error</div>
                <div className="text-red-700 text-sm mt-1">{error}</div>
              </div>
            )}
          </div>

          {loading && <Loading />}

          {recommendations && recommendations.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations ({recommendations.length})
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((book, index) => (
                  <RecommendationCard
                    key={book.isbn || `book-${index}`}
                    item={book}
                  />
                ))}
              </div>
            </section>
          )}

          {!loading && recommendations.length === 0 && !error && (
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No recommendations yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try searching for a book title above.
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="wrapper py-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader subtitle="Popular Books" />
          <BookSlider books={popularBooks.slice(0, 15)} />
        </div>
      </section>
    </div>
  );
}
