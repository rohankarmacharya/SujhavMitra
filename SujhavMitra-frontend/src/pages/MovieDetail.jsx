import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import { fetchPopularMovies, fetchMovieById } from "../services/api";
import useWishlist from "../hooks/useWishlist";
import { fetchPosterUrlForTitle } from "../utils/tmdb";
import SectionHeader from "../components/SectionHeader";
import BackToPage from "../components/ui/BackToPage";
import RelatedMovies from "../components/RelatedMovies";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!movie);
  const { isSaved, toggle } = useWishlist();
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(true);

  // Normalize movie data from different sources
  const normalizedMovie = useMemo(() => {
    if (!movie) return null;

    return {
      id: movie.id || id,
      title: movie.title || movie.name || "Untitled",
      overview: movie.overview || movie.description || "No overview available.",
      release_date: movie.release_date || movie.year || null,
      poster_path: movie.poster_path || movie.image || null,
      vote_average: movie.vote_average || movie.rating || 0,
      vote_count: movie.vote_count || 0,
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
      runtime: movie.runtime || null,
      tagline: movie.tagline || "",
      status: movie.status || "Released",
      homepage: movie.homepage || null,
    };
  }, [movie, id]);

  useEffect(() => {
    const load = async () => {
      if (movie) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Try to get from wishlist data if available in location state
        if (location.state?.wishlistItem) {
          setMovie(location.state.wishlistItem);
          return;
        }

        // Try backend detail endpoint
        try {
          const byId = await fetchMovieById(id);
          setMovie(byId);
          return;
        } catch (error) {
          console.log("Could not fetch from backend, trying fallback...");
        }

        // Fallback to popular list lookup
        const popular = await fetchPopularMovies();
        const found = popular.find((m) => String(m.id) === String(id));
        if (found) {
          setMovie(found);
        } else {
          throw new Error("Movie not found");
        }
      } catch (error) {
        console.error("Error loading movie:", error);
        // Optionally redirect to movies list or show error state
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, movie, location.state]);

  useEffect(() => {
    let alive = true;

    const getPosterUrl = async () => {
      if (!normalizedMovie) return;

      // If we already have a poster URL, use it
      if (normalizedMovie.poster_path) {
        if (normalizedMovie.poster_path.startsWith("http")) {
          if (alive) {
            setPosterUrl(normalizedMovie.poster_path);
            setPosterLoading(false);
          }
          return;
        }

        // If it's a TMDB path, construct the full URL
        if (!normalizedMovie.poster_path.startsWith("/")) {
          const url = `https://image.tmdb.org/t/p/w500${normalizedMovie.poster_path}`;
          if (alive) {
            setPosterUrl(url);
            setPosterLoading(false);
          }
          return;
        }
      }

      // Fallback to searching by title
      try {
        const t = normalizedMovie.title;
        const y = normalizedMovie.release_date
          ? new Date(normalizedMovie.release_date).getFullYear()
          : null;
        if (!t) return;

        const url = await fetchPosterUrlForTitle(t, y, "w500");
        if (alive && url) {
          setPosterUrl(url);
        }
      } catch (error) {
        console.error("Error fetching poster:", error);
      } finally {
        if (alive) {
          setPosterLoading(false);
        }
      }
    };

    getPosterUrl();

    return () => {
      alive = false;
    };
  }, [normalizedMovie]);

  if (loading) {
    return (
      <div className="wrapper py-8">
        <p>Loading movie...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="wrapper py-8">
        <p className="mb-4">Movie not found.</p>
        <BackToPage to="/movies" />
      </div>
    );
  }

  if (!normalizedMovie) {
    return (
      <div className="wrapper py-8">
        <p className="mb-4">Movie not found or failed to load.</p>
        <BackToPage to="/movies" />
      </div>
    );
  }

  const {
    title,
    overview,
    genres,
    cast,
    crew,
    release_date,
    vote_average,
    vote_count,
    runtime,
    status,
  } = normalizedMovie;

  const saved = isSaved("movie", id);

  // Format runtime (if available)
  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="wrapper py-8 mb-5">
      <BackToPage to="/movies" />
      <div className="mt-4 bg-white p-6 rounded-lg shadow relative">
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {/* Poster Column */}
          <div className="md:col-span-1 md:sticky md:top-24 self-start">
            <div className="relative">
              {posterUrl ? (
                <div className="mx-auto w-full rounded-md overflow-hidden aspect-[2/3] bg-gray-100 relative">
                  {posterLoading && (
                    <div className="absolute inset-0 animate-pulse bg-gray-200" />
                  )}
                  <img
                    src={posterUrl}
                    alt={title}
                    className={`h-full w-full object-cover ${
                      posterLoading ? "opacity-0" : "opacity-100"
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-movie.svg";
                      setPosterLoading(false);
                    }}
                    onLoad={() => setPosterLoading(false)}
                  />
                </div>
              ) : (
                <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] rounded-md bg-gray-100 text-gray-500 text-sm aspect-[2/3] flex items-center justify-center">
                  No image available
                </div>
              )}

              {/* Rating */}
              {vote_average > 0 && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-sm">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">
                      {vote_average.toFixed(1)}
                    </span>
                    {vote_count > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({vote_count})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                {release_date && (
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-900">
                      Release:
                    </span>
                    <span>{formatDate(release_date)}</span>
                  </div>
                )}

                {status && status !== "Released" && (
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-900">
                      Status:
                    </span>
                    <span className="capitalize">{status.toLowerCase()}</span>
                  </div>
                )}

                {runtime > 0 && (
                  <div className="flex">
                    <span className="w-24 font-medium text-gray-900">
                      Runtime:
                    </span>
                    <span>{formatRuntime(runtime)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <SectionHeader title={title} />
              <button
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggle("movie", id, movie)}
                className={`rounded-full p-2 ring-1 transition ${
                  saved
                    ? "bg-red-50 text-red-600 ring-red-100"
                    : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
                </svg>
              </button>
            </div>

            {/* Genres */}
            {genres && genres.length > 0 && (
              <div className="genre flex flex-wrap gap-2 mb-4">
                {genres.map((genre, i) => (
                  <span key={`genre-${i}`}>{genre}</span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="card-details">
              <h2>Overview</h2>
              <p className="text-gray-800 leading-relaxed">{overview}</p>
            </div>

            {/* Cast */}
            {cast && cast.length > 0 && (
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

            {/* Crew */}
            {crew && crew !== "N/A" && (
              <div className="crew">
                <h3>Crew</h3>
                <p>{Array.isArray(crew) ? crew.join(", ") : crew}</p>
              </div>
            )}
            <div className="pagelink mt-2">
              {normalizedMovie.homepage && (
                <a
                  href={normalizedMovie.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline"
                >
                  Watch now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
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
