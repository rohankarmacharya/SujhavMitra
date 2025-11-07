import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { fetchPopularMovies, fetchMovieById } from "../services/api";
import useWishlist from "../hooks/useWishlist";
import { fetchPosterUrlForTitle } from "../utils/tmdb";

export default function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!movie);
  const { isSaved, toggle } = useWishlist();
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (movie) {
        setLoading(false);
        return;
      }
      try {
        // Try backend detail endpoint first
        const byId = await fetchMovieById(id);
        setMovie(byId);
      } catch {
        // Fallback to popular list lookup
        try {
          const popular = await fetchPopularMovies();
          const found = popular.find((m) => String(m.id) === String(id));
          if (found) setMovie(found);
        } finally {
          // continue
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const t = movie?.title;
      const y = movie?.year;
      if (!t) return;
      const url = await fetchPosterUrlForTitle(t, y, "w500");
      if (alive) setPosterUrl(url);
    })();
    return () => {
      alive = false;
    };
  }, [movie?.title, movie?.year]);

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
        <Link className="text-indigo-600 underline" to="/movies">
          Back to Movies
        </Link>
      </div>
    );
  }

  const { title, overview, genres, cast, crew } = movie;
  const saved = isSaved("movie", id);

  return (
    <div className="wrapper py-8">
      <Link className="text-indigo-600 underline" to="/movies">
        ← Back to Movies
      </Link>
      <div className="mt-4 bg-white p-6 rounded-lg shadow relative">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{title}</h1>
          <button
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggle("movie", id, movie)}
            className={`rounded-full p-2 ring-1 transition ${
              saved ? "bg-red-50 text-red-600 ring-red-100" : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
            </svg>
          </button>
        </div>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 md:sticky md:top-24 self-start">
            {posterUrl ? (
              <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] rounded-md overflow-hidden aspect-[2/3] bg-gray-100 relative">
                {posterLoading && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
                <img
                  src={posterUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-movie.svg";
                    setPosterLoading(false);
                  }}
                  onLoad={() => setPosterLoading(false)}
                />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] rounded-md bg-gray-100 text-gray-500 text-sm aspect-[2/3] flex items-center justify-center">No image</div>
            )}
          </div>
          <div className="md:col-span-2">
            {genres && Array.isArray(genres) && genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g, i) => (
                  <span key={`g-${i}`} className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 ring-1 ring-cyan-100">
                    {g}
                  </span>
                ))}
              </div>
            )}
            {overview && <p className="text-base leading-7 text-gray-800 mt-4">{overview}</p>}
            {cast && Array.isArray(cast) && cast.length > 0 && (
              <p className="text-sm text-gray-700 mt-4"><span className="font-medium text-gray-900">Cast:</span> {cast.join(", ")}</p>
            )}
            {crew && (
              <p className="text-sm text-gray-700 mt-2"><span className="font-medium text-gray-900">Crew:</span> {crew}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
