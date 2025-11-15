import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPopularMovies, fetchMovieRecommendations } from "../services/api";
import MovieCard from "../components/MovieCard";
import SectionHeader from "../components/SectionHeader";
import SearchBox from "../components/ui/SearchBox";
import ErrorMessage from "../components/ui/ErrorMessage";
import Badge from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import useSearch from "../hooks/useSearch";
import { showToast } from "../utils/toast";
import PopularMovies from "../components/recommendation/PopularMovies";

export default function Movies() {
  const navigate = useNavigate();

  const {
    query,
    setQuery,
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
    onSearchComplete: (allResults, searchedMovie) => {
      // Redirect to the searched movie's detail page with all recommendations
      const movieToShow = searchedMovie || allResults[0];
      if (movieToShow && movieToShow.id) {
        navigate(`/movie/${movieToShow.id}`, {
          state: {
            movieData: movieToShow,
            allRecommendations: allResults,
          },
        });
      }
    },
  });

  // Toast reminder
  useEffect(() => {
    showToast("You are in Movies");
  }, []);

  return (
    <div className="moviepage pt-10 pb-16">
      <SectionHeader subtitle="Browse and Discover" />

      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <Badge variant="cyan" className="gap-2">
              <span role="img" aria-label="movies">
                🎬
              </span>
              Discover Movies • Get Recommendations you'll love
            </Badge>
          </div>

          <Card className="mb-8">
            <CardContent className="p-5 md:p-6">
              <div>
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
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Searching for movie...</div>
              </div>
            </section>
          )}
        </div>
      </div>

      <PopularMovies title="Popular Movies" limit={9} />
    </div>
  );
}
