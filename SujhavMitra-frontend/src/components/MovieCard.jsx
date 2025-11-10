import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Card, CardContent, CardTitle } from "./ui/Card";
import Badge from "./ui/Badge";
import useWishlist from "../hooks/useWishlist";
import { fetchPosterUrlForTitle } from "../utils/tmdb";

export default function MovieCard({ movie }) {
  const { user } = useAuth();
  //Always call hooks at the top level
  const { isSaved, toggle } = useWishlist();
  const [posterUrl, setPosterUrl] = useState(null);
  const [posterLoading, setPosterLoading] = useState(true);

  // Safely extract values (handle null movie)
  const id = movie?.id;
  const title = movie?.title;
  const overview = movie?.overview;
  const genres = movie?.genres;
  // const cast = movie?.cast;
  const year = movie?.year;

  // Avoid calling functions when movie is null
  const saved = movie ? isSaved("movie", id) : false;

  // Compute the link path
  const to = id
    ? `/movie/${id}`
    : title
    ? `/movie/title/${encodeURIComponent(
        title.replace(/\s+/g, "-").toLowerCase()
      )}`
    : null;

  // Hooks can have conditions inside them, but not around them
  useEffect(() => {
    if (!movie) return;
    let alive = true;
    (async () => {
      const url = await fetchPosterUrlForTitle(title, year);
      if (alive) setPosterUrl(url);
    })();
    return () => {
      alive = false;
    };
  }, [movie, title, year]);

  // Conditional rendering after hooks
  if (!movie || !to) return null;

  return (
    <Card className="group relative h-full overflow-hidden transition hover:shadow-lg">
      <Link to={to} state={{ movie }} className="block h-full">
        <CardContent className="flex h-full flex-col">
          {/* Wishlist button */}
          {/* Wishlist Button (top-right corner of the image) */}
          {user && user.role_id === 3 && (
            <div className="absolute right-2 top-2 z-10">
              <button
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle("movie", id, movie);
                }}
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
          )}

          {/* Poster */}
          <div className="mb-3 overflow-hidden rounded-md bg-gray-100 aspect-[2/3] relative">
            {posterLoading && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="block h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-movie.svg";
                  setPosterLoading(false);
                }}
                onLoad={() => setPosterLoading(false)}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-gray-500 text-sm"
                onLoad={() => setPosterLoading(false)}
              >
                No image
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          </div>

          {/* Title */}
          <CardTitle
            title={title}
            className="text-base md:text-xl break-words line-clamp-2"
          >
            {title}
          </CardTitle>

          {/* Genres */}
          {Array.isArray(genres) && genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {genres.slice(0, 3).map((g, i) => (
                <Badge key={`${id}-g-${i}`} className="text-[10px] px-2 py-0.5">
                  {g}
                </Badge>
              ))}
            </div>
          )}

          {/* Overview */}
          {overview && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-800">
              {overview}
            </p>
          )}

          <div className="mt-auto" />
        </CardContent>
      </Link>
    </Card>
  );
}
