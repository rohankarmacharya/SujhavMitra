import React, { useEffect, useState } from "react";
import { fetchPopularMovies, fetchMovieRecommendations } from "../services/api";
import MovieCard from "../components/MovieCard";
import MovieSlider from "../components/recommendation/MovieSlider";
import MovieSkeleton from "../components/MovieSkeleton";
import SectionHeader from "../components/SectionHeader";
import SearchBox from "../components/ui/SearchBox";
import ErrorMessage from "../components/ui/ErrorMessage";
import Badge from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import useSearch from "../hooks/useSearch";
import { showToast } from "../utils/toast";

export default function Movies() {
  const [popular, setPopular] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const {
    query,
    setQuery,
    results: recommendations,
    suggestions,
    loading,
    error,
    handleSearch,
    handleClear,
    fetchSuggestions,
  } = useSearch({
    fetchRecommendations: fetchMovieRecommendations,
    fetchPopularItems: fetchPopularMovies,
    onError: (err) => console.error("Movie search error:", err),
  });

  // Fetch popular movies
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

  // Toast reminder
  useEffect(() => {
    showToast("You are in Movies");
  }, []);

  return (
    <div className="Bookpage pt-10 pb-16">
      <SectionHeader subtitle="Browse and Discover" />

      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <Badge variant="cyan" className="gap-2">
              <span role="img" aria-label="movies">
                🎬
              </span>
              You are in Movies
            </Badge>
          </div>

          <Card className="mb-8">
            <CardContent className="p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Movies
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Search by title to get recommendations powered by your dataset.
              </p>

              <div className="mt-5">
                <SearchBox
                  query={query}
                  onQueryChange={setQuery}
                  onSearch={handleSearch}
                  onClear={handleClear}
                  loading={loading}
                  placeholder="Enter movie title (e.g. 'Inception')"
                  suggestions={suggestions}
                  onSuggestionsFetch={fetchSuggestions}
                />
              </div>

              {error && <ErrorMessage message={error} className="mt-4" />}
            </CardContent>
          </Card>

          {loading && (
            <section className="mb-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieSkeleton key={`search-skeleton-${i}`} />
                ))}
              </div>
            </section>
          )}

          {recommendations && recommendations.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations ({recommendations.length})
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((movie, idx) => (
                  <MovieCard key={movie.id || idx} movie={movie} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section className="wrapper py-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {loadingPopular &&
              popular.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <MovieSkeleton key={`popular-skeleton-${i}`} />
              ))}

            {!loadingPopular &&
              popular
                .slice(0, Math.min(visibleCount, popular.length))
                .map((movie, idx) => (
                  <MovieCard key={movie.id || idx} movie={movie} />
                ))}
          </div>

          {!loadingPopular && visibleCount < popular.length && (
            <div className="flex justify-center mt-6">
              <button
                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + 12, popular.length)
                  )
                }
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
