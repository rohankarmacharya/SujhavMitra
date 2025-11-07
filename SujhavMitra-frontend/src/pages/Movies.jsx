import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { fetchPopularMovies, fetchMovieRecommendations } from "../services/api";
import MovieCard from "../components/MovieCard";
import MovieSlider from "../components/recommendation/MovieSlider";
import MovieSkeleton from "../components/MovieSkeleton";
import SectionHeader from "../components/SectionHeader";
import "../index.css";

export default function Movies() {
  const [popular, setPopular] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [query, setQuery] = useState("");
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const suggRef = useRef(null);
  const suppressSuggestRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      setLoadingPopular(true);
      try {
        const data = await fetchPopularMovies();
        setPopular(data);
      } finally {
        setLoadingPopular(false);
      }
    };
    load();
  }, []);

  // Toast reminder of current section
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("app:toast", { detail: { message: "You are in Movies", variant: "info", timeout: 2200 } })
      );
    } catch {}
  }, []);

  const handleSearch = useCallback(
    async (e, qOverride) => {
      if (e) e.preventDefault();
      const q = (typeof qOverride === "string" ? qOverride : query || "").trim();
      if (!q) {
        setError("Please enter a movie title to search.");
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
      setLoading(true);
      setRecs([]);
      try {
        const data = await fetchMovieRecommendations(q);
        if (data.error) {
          setError(data.error);
          setRecs([]);
        } else {
          setRecs(data);
          if (!data.length) {
            setError("No recommendations found for this title.");
          }
        }
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const onInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (error) setError(null);
    const s = val.trim();
    if (!s) {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
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
        handleSearch(undefined, choice);
      }
    } else if (e.key === "Escape") {
      setSuggestionsOpen(false);
    }
  };

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
        const data = await fetchMovieRecommendations(s);
        const titles = Array.isArray(data) ? data.map((m) => m.title).filter(Boolean) : [];
        const low = s.toLowerCase();
        // starts-with from backend recs
        let uniq = Array.from(new Set(titles))
          .filter((tt) => tt.toLowerCase().startsWith(low))
          .slice(0, 8);
        // fallback to popular if backend yields nothing useful (e.g., single-letter input)
        if (uniq.length === 0) {
          const list = Array.isArray(popular) ? popular : [];
          const popTitles = list.map((m) => m.title).filter(Boolean);
          uniq = Array.from(new Set(popTitles))
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
      // perform direct search to avoid state timing issues
      (async () => {
        try {
          setError(null);
          setRecs([]);
          setLoading(true);
          const data = await fetchMovieRecommendations(prefill.trim());
          if (data.error) {
            setError(data.error);
            setRecs([]);
          } else {
            setRecs(data);
            if (!data.length) {
              setError("No recommendations found for this title.");
            }
          }
        } catch (err) {
          setError(err.message || String(err));
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Bookpage pt-10 pb-16">
      <SectionHeader subtitle="Browse and Discover" />
      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100">
              <span role="img" aria-label="movies">🎬</span>
              You are in Movies
            </span>
          </div>
          <div className="bg-white border rounded-xl shadow-sm p-5 md:p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Movies</h1>
            <p className="text-sm text-gray-600 mt-1">
              Search by title to get recommendations powered by your dataset.
            </p>

            <div className="relative flex flex-col sm:flex-row gap-3 mt-5">
              <input
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter movie title (e.g. 'Fight Club')"
                value={query}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                ref={inputRef}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen}
                aria-controls="movies-sugg-list"
                aria-activedescendant={activeIdx >= 0 ? `movie-sugg-${activeIdx}` : undefined}
              />
              {/* Suggestions */}
              {suggestionsOpen && suggestions.length > 0 && (
                <div ref={suggRef} className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border bg-white shadow-lg">
                  <ul id="movies-sugg-list" role="listbox" className="max-h-64 overflow-auto py-1 text-sm">
                    {suggestions.map((t, i) => (
                      <li
                        key={`${t}-${i}`}
                        id={`movie-sugg-${i}`}
                        role="option"
                        aria-selected={i === activeIdx}
                        className={`cursor-pointer px-3 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${i === activeIdx ? "bg-gray-200" : ""}`}
                        onClick={() => {
                          setQuery(t);
                          setSuggestionsOpen(false);
                          handleSearch(undefined, t);
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
                onClick={() => {
                  setQuery("");
                  setRecs([]);
                  setError(null);
                }}
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

          {loading && (
            <section className="mb-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieSkeleton key={`srch-skel-${i}`} />
                ))}
              </div>
            </section>
          )}

          {recs && recs.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations ({recs.length})
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recs.map((m, idx) => (
                  <MovieCard key={m.id || idx} movie={m} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section className="wrapper py-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>
          {!loadingPopular && popular.length > 0 && (
            <MovieSlider movies={popular.slice(0, Math.min(visibleCount, popular.length))} />
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {loadingPopular && popular.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => <MovieSkeleton key={i} />)}
            {!loadingPopular &&
              popular
                .slice(0, Math.min(visibleCount, popular.length))
                .map((m, idx) => <MovieCard key={m.id || idx} movie={m} />)}
          </div>
          {!loadingPopular && visibleCount < popular.length && (
            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
                onClick={() => setVisibleCount((c) => Math.min(c + 12, popular.length))}
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
