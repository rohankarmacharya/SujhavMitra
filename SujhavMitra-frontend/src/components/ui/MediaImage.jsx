import { useState, useEffect } from "react";

export default function MediaImage({
  src,
  alt,
  fallback = "/placeholder-book.svg",
  className = "",
  aspectRatio = "2/3",
  loading = "lazy",
  onLoad,
  onError,
}) {
  const [imgLoading, setImgLoading] = useState(!!src);
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (!src) setImgLoading(false);
    setImgSrc(src);
  }, [src]);

  const handleLoad = () => {
    setImgLoading(false);
    onLoad?.();
  };

  const handleError = (e) => {
    e.currentTarget.src = fallback;
    setImgLoading(false);
    onError?.(e);
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ aspectRatio }}
    >
      {imgLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className={`h-full w-full object-cover transition ${
            imgLoading ? "opacity-0" : "opacity-100"
          }`}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
          No image available
        </div>
      )}
    </div>
  );
}
