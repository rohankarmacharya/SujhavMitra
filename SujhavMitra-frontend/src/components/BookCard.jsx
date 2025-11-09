import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "./ui/Card";
import Badge from "./ui/Badge";
import useWishlist from "../hooks/useWishlist";

const RecommendationCard = ({ item }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Prefer ISBN route
    if (item.isbn) {
      navigate(`/book/${item.isbn}`, { state: { book: item } });
      return;
    }
    // Fallback: navigate by title slug, BookDetail will fetch via title
    if (item.title) {
      const slug = encodeURIComponent(item.title.replace(/\s+/g, "-").toLowerCase());
      navigate(`/book/title/${slug}`, { state: { book: item } });
    }
  };

  const hasIsbn = Boolean(item.isbn);
  const hasTitle = Boolean(item.title);
  const to = hasIsbn
    ? { pathname: `/book/${item.isbn}`, state: { book: item } }
    : hasTitle
    ? {
        pathname: `/book/title/${encodeURIComponent(
          item.title.replace(/\s+/g, "-").toLowerCase()
        )}`,
        state: { book: item },
      }
    : null;

  const { isSaved, toggle } = useWishlist();
  const saved = isSaved("book", item.isbn || item.title);

  const coverUrl = item.imageurl || (item.isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(item.isbn)}-L.jpg` : null);
  const [imgLoading, setImgLoading] = useState(true);
  // stop skeleton if there's no image to load
  useEffect(() => {
    if (!coverUrl) setImgLoading(false);
  }, [coverUrl]);

  const CardInner = (
    <Card className="group relative h-full overflow-hidden transition hover:shadow-lg" as="div">
      <div className="w-full bg-gray-100 aspect-[2/3] overflow-hidden relative">
        {imgLoading && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.05]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-book.svg";
              setImgLoading(false);
            }}
            onLoad={() => setImgLoading(false)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm" onLoad={() => setImgLoading(false)}>No image</div>
        )}
      </div>
      <CardContent>
        <CardTitle title={item.title} className="text-base md:text-lg break-words line-clamp-2">{item.title}</CardTitle>
        {item.author && (
          <p className="mt-2 text-sm text-gray-700">Author: {item.author}</p>
        )}
        {Array.isArray(item.genres) && item.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.genres.slice(0, 3).map((g, i) => (
              <Badge key={`g-${i}`} className="text-[10px] px-2 py-0.5">
                {g}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <div className="relative h-full">
        {/* Heart outside Link to avoid interference */}
        <div className="absolute right-2 top-2 z-10">
          <button
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle("book", item.isbn || item.title, item);
            }}
            className={`rounded-full p-2 ring-1 transition ${
              saved ? "bg-red-50 text-red-600 ring-red-100" : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
            </svg>
          </button>
        </div>
        <Link
          to={to.pathname}
          state={to.state}
          className="block h-full cursor-pointer"
          role="link"
        >
          {CardInner}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full opacity-80 cursor-not-allowed" role="group" aria-disabled>
      {CardInner}
    </div>
  );
};

export default RecommendationCard;
