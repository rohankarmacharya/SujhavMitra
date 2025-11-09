import { useState } from "react";

/**
 * Reusable image component with loading state and fallback
 * Used for book covers and movie posters
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/placeholder-image.svg",
  className = "",
  aspectRatio = "2/3", // Default for posters/covers
  showLoading = true,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (e) => {
    setError(true);
    setLoading(false);
    if (fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 rounded-md ${className}`}
      style={{ aspectRatio }}
    >
      {showLoading && loading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
          {error ? "Image unavailable" : "No image"}
        </div>
      )}
    </div>
  );
}
