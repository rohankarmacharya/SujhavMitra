import { useEffect, useState } from "react";
import { fetchMovieRecommendations } from "../services/api";
import MovieCard from "./MovieCard";
import Skeleton from "./Skeleton";

export default function RelatedMovies({
  movieTitle,
  movieId,
  currentMovieGenres = [],
}) {
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRelatedMovies = async () => {
      if (!movieTitle) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch recommendations based on the current movie title
        const recommendations = await fetchMovieRecommendations(movieTitle);

        // Filter out the current movie from recommendations
        const filtered = recommendations.filter(
          (movie) => String(movie.id) !== String(movieId)
        );

        // If we have genres, prioritize movies with matching genres
        let sorted = filtered;

        // Limit to 6 related movies
        setRelatedMovies(sorted.slice(0, 10));
      } catch (err) {
        console.error("Error fetching related movies:", err);
        setError("Failed to load related movies");
      } finally {
        setLoading(false);
      }
    };

    loadRelatedMovies();
  }, [movieTitle, movieId, currentMovieGenres]);

  if (loading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Movies
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`related-skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Movies
        </h2>
        <div className="text-center py-8 text-gray-500">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (relatedMovies.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Movies</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedMovies.map((movie, idx) => (
          <MovieCard key={movie.id || idx} movie={movie} />
        ))}
      </div>
    </section>
  );
}
