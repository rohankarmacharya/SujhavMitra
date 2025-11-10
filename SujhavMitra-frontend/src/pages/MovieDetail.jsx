import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchMovieById, fetchPopularMovies } from "../services/api";
import { useAuth } from "../context/useAuth";
import useWishlist from "../hooks/useWishlist";
import { fetchPosterUrlForTitle } from "../utils/tmdb";
import SectionHeader from "../components/SectionHeader";
import BackToPage from "../components/ui/BackToPage";
import RelatedMovies from "../components/RelatedMovies";

export default function MovieDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggle } = useWishlist();
  const [posterUrl, setPosterUrl] = useState(null);

  // Normalize movie data
  const normalizedMovie = useMemo(() => {
    if (!movie) return null;
    return {
      id: movie.id || id,
      title: movie.title || movie.name || "Untitled",
      overview: movie.overview || movie.description || "No overview available.",
      release_date: movie.release_date || movie.year || null,
      poster_path: movie.poster_path || movie.image || null,
      genres: Array.isArray(movie.genres)
        ? movie.genres
        : typeof movie.genres === "string"
        ? movie.genres.split(",").map((g) => g.trim())
        : [],
      cast: Array.isArray(movie.cast)
        ? movie.cast
        : typeof movie.cast === "string"
        ? movie.cast.split(",").map((c) => c.trim())
        : [],
      crew: movie.crew || "N/A",
      homepage: movie.homepage || null,
    };
  }, [movie, id]);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      try {
        const byId = await fetchMovieById(id);
        if (byId) setMovie(byId);
        else {
          const popular = await fetchPopularMovies();
          const found = popular.find((m) => String(m.id) === String(id));
          setMovie(found || null);
        }
      } catch (error) {
        console.error("Failed to load movie:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id]);

  useEffect(() => {
    let alive = true;
    const getPoster = async () => {
      if (!normalizedMovie) return;
      if (normalizedMovie.poster_path?.startsWith("http")) {
        if (alive) setPosterUrl(normalizedMovie.poster_path);
        return;
      }
      try {
        const url = await fetchPosterUrlForTitle(
          normalizedMovie.title,
          normalizedMovie.release_date
            ? new Date(normalizedMovie.release_date).getFullYear()
            : null,
          "w500"
        );
        if (alive) setPosterUrl(url);
      } catch (error) {
        console.error("Error fetching poster:", error);
      }
    };
    getPoster();
    return () => (alive = false);
  }, [normalizedMovie]);

  if (loading)
    return (
      <div className="wrapper py-8">
        <p>Loading movie...</p>
      </div>
    );

  if (!movie)
    return (
      <div className="wrapper py-8">
        <p className="mb-4">Movie not found.</p>
        <BackToPage to="/movies" />
      </div>
    );

  const { title, overview, genres, cast, crew, homepage } = normalizedMovie;
  const saved = isSaved("movie", id);

  return (
    <div className="wrapper py-8 mb-5">
      <BackToPage to="/movies" />
      <div className="mt-4 bg-white p-6 rounded-lg shadow relative">
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {/* Poster */}
          <div className="md:col-span-1 md:sticky md:top-24 self-start">
            <div className="relative">
              {posterUrl ? (
                <div className="mx-auto w-full rounded-md overflow-hidden aspect-[2/3] bg-gray-100 relative">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-movie.svg")
                    }
                  />
                </div>
              ) : (
                <div className="mx-auto w-full max-w-[240px] rounded-md bg-gray-100 text-gray-500 text-sm aspect-[2/3] flex items-center justify-center">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <SectionHeader title={title} />
              {user && user.role_id === 3 && (
                <button
                  aria-label={
                    saved ? "Remove from wishlist" : "Add to wishlist"
                  }
                  onClick={() => toggle("movie", id, movie)}
                  className={`rounded-full p-2 ring-1 transition ${
                    saved
                      ? "bg-red-50 text-red-600 ring-red-100"
                      : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  ❤️
                </button>
              )}
            </div>

            {genres.length > 0 && (
              <div className="genre flex flex-wrap gap-2 mb-4">
                {genres.map((genre, i) => (
                  <span key={`genre-${i}`}>{genre}</span>
                ))}
              </div>
            )}

            <div className="card-details">
              <h2>Overview</h2>
              <p className="text-gray-800 leading-relaxed">{overview}</p>
            </div>

            {cast.length > 0 && (
              <div className="cast">
                <h3>Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {cast.slice(0, 10).map((person, i) => (
                    <span key={`cast-${i}`}>{person}</span>
                  ))}
                  {cast.length > 10 && (
                    <span className="text-xs text-gray-500 self-center">
                      +{cast.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {crew && crew !== "N/A" && (
              <div className="crew">
                <h3>Crew</h3>
                <p>{Array.isArray(crew) ? crew.join(", ") : crew}</p>
              </div>
            )}

            {homepage && (
              <div className="pagelink mt-2">
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  Watch now
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 mb-8">
        <RelatedMovies
          movieTitle={title}
          movieId={id}
          currentMovieGenres={genres}
        />
      </div>
    </div>
  );
}
