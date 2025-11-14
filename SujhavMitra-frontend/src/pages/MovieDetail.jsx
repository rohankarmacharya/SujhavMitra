import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchMovieById,
  fetchPopularMovies,
  fetchMovieRecommendations,
} from "../services/api";
import { useAuth } from "../context/useAuth";
import useWishlist from "../hooks/useWishlist";
import { fetchPosterUrlForTitle } from "../utils/tmdb";
import SectionHeader from "../components/SectionHeader";
import BackToPage from "../components/ui/BackToPage";
import MovieCard from "../components/MovieCard";
import Skeleton from "../components/Skeleton";

export default function MovieDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { isSaved, toggle } = useWishlist();
  const [posterUrl, setPosterUrl] = useState(null);
  const navigate = useNavigate();

  // Normalize movie data
  const normalizedMovie = useMemo(() => {
    if (!movie) return null;

    // Capitalize first letter of each sentence in overview
    const formatOverview = (text) => {
      if (!text) return "No overview available.";
      return (
        text
          .split(".")
          .map((sentence) => {
            const trimmed = sentence.trim();
            if (!trimmed) return "";
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
          })
          .join(". ") + "."
      );
    };

    // Format cast as comma-separated string
    const formatCast = (cast) => {
      if (!cast) return "No cast information available.";
      if (Array.isArray(cast)) return cast.join(", ");
      return String(cast);
    };

    return {
      id: movie.id || id,
      title: movie.title || movie.name || "Untitled",
      overview: formatOverview(movie.overview || movie.description),
      release_date: movie.release_date || movie.year || null,
      poster_path: movie.poster_path || movie.image || null,
      genres: Array.isArray(movie.genres)
        ? movie.genres
        : typeof movie.genres === "string"
        ? movie.genres.split(",").map((g) => g.trim())
        : [],
      cast: formatCast(movie.cast),
      crew: Array.isArray(movie.crew)
        ? movie.crew.join(", ")
        : movie.crew || "N/A",
      homepage: movie.homepage || null,
    };
  }, [movie, id]);

  // Load movie details
  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      try {
        // First, check if movie data was passed via navigation state
        const passedMovieData = location.state?.movieData;
        const passedRecommendations = location.state?.allRecommendations;

        if (passedMovieData) {
          // Use the passed movie data
          setMovie(passedMovieData);

          // Set recommendations (filter out current movie)
          if (passedRecommendations && Array.isArray(passedRecommendations)) {
            const filtered = passedRecommendations.filter(
              (rec) => String(rec.id) !== String(id)
            );
            setRecommendations(filtered);
          }
        } else {
          // Fallback to fetching by ID
          const byId = await fetchMovieById(id);
          if (byId) {
            setMovie(byId);
          } else {
            const popular = await fetchPopularMovies();
            const found = popular.find((m) => String(m.id) === String(id));
            setMovie(found || null);
          }
        }
      } catch (error) {
        console.error("Failed to load movie:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id, location.state]);

  // Load recommendations based on movie title
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!normalizedMovie?.title) return;

      // Skip if we already have recommendations from navigation state
      if (recommendations.length > 0) return;

      setLoadingRecommendations(true);
      try {
        const recs = await fetchMovieRecommendations(normalizedMovie.title);
        // Filter out the current movie from recommendations
        const filtered = Array.isArray(recs)
          ? recs.filter((rec) => String(rec.id) !== String(id))
          : [];
        setRecommendations(filtered);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [normalizedMovie?.title, id, recommendations.length]);

  // Fetch poster
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

  if (loading) return <Skeleton />;

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

      {/* Movie Details Section */}
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
              <button
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!user) {
                    navigate("/login");
                    return;
                  }

                  toggle("movie", id, movie);
                }}
                className="rounded-full p-2 ring-1 transition hover:scale-105"
              >
                {saved ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-red-600"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {genres.length > 0 && (
              <div className="genre flex flex-wrap gap-2 mb-4">
                {genres.map((genre, i) => (
                  <span key={`genre-${i}`}>{genre}</span>
                ))}
              </div>
            )}

            <div className="card-details mb-4">
              <h2 className="font-semibold mb-1">Overview</h2>
              <p className="text-gray-800 leading-relaxed">{overview}</p>
            </div>

            {cast && (
              <div className="cast mb-2">
                <h3 className="font-semibold mb-1">Cast</h3>
                <p>{cast}</p>
              </div>
            )}

            {crew && crew !== "N/A" && (
              <div className="crew mb-2">
                <h3 className="font-semibold mb-1">Director</h3>
                <p>{crew}</p>
              </div>
            )}

            <div className="pagelink mt-3">
              {homepage ? (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
                >
                  Watch now
                </a>
              ) : (
                <button
                  disabled
                  className="inline-block bg-gray-400 text-white px-4 py-2 rounded-lg text-sm cursor-not-allowed"
                >
                  No link available
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recommended Movies ({recommendations.length})
        </h2>

        {loadingRecommendations ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`rec-skeleton-${i}`} />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((movie, idx) => (
              <MovieCard key={movie.id || idx} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recommendations available.</p>
        )}
      </div>
    </div>
  );
}
