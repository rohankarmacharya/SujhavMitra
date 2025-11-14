import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import WishlistButton from "./ui/WishlistButton";

const RecommendationCard = ({ item }) => {
  const { user } = useAuth();
  const hasIsbn = Boolean(item.isbn);
  const hasTitle = Boolean(item.title);

  // Build the link path
  const to = hasIsbn
    ? `/book/${item.isbn}`
    : hasTitle
    ? `/book/title/${encodeURIComponent(
        item.title.replace(/\s+/g, "-").toLowerCase()
      )}`
    : null;

  const coverUrl = item.imageurl;

  const CardInner = (
    <div className="card bookcard overflow-hidden">
      <div className="relative w-full aspect-[2/3] overflow-hidden">
        <img src={coverUrl} alt={item.title} loading="lazy" />

        {/* Wishlist Button (top-right corner of the image) */}
        {user && user.role_id === 3 && (
          <div className="absolute top-2 right-2 z-10">
            <WishlistButton
              type="book"
              id={item.isbn || item.title}
              item={item}
            />
          </div>
        )}
      </div>

      {/*Text content */}
      <div className="card-content">
        <h2 title={item.title}>{item.title}</h2>
        {item.author && <p>Author: {item.author}</p>}

        {/* Rating and Popularity Information */}
        {(item.avg_rating || item.similarity_score) && (
          <div className="flex items-center justify-between text-sm text-gray-700 mt-3 mb-2">
            {item.avg_rating && (
              <div className="flex items-center space-x-1">
                <span className="font-medium text-cyan-700">
                  ⭐ {item.avg_rating}
                </span>
                <span className="text-gray-500"> Rating </span>
              </div>
            )}
            {/* Similarity Score below author */}
            {item.similarity_score && (
              <div className="mt-2 mb-2">
                <span className="rounded-full bg-[#837fcb] px-3 py-1 text-xs font-medium text-white ring-1 ring-purple-100">
                  Similarity: {item.similarity_score}
                </span>
              </div>
            )}
          </div>
        )}

        {item.publisher && <p> Publisher: {item.publisher} </p>}
        {item.publishdate && (
          <p className="text-sm text-gray-500">Year: {item.publishdate}</p>
        )}
      </div>
    </div>
  );

  // Wrap in link if possible
  if (to) {
    return (
      <Link to={to} state={{ book: item }} role="link">
        {CardInner}
      </Link>
    );
  }

  // Otherwise, show disabled card
  return (
    <div
      className="h-full opacity-80 cursor-not-allowed"
      role="group"
      aria-disabled
    >
      {CardInner}
    </div>
  );
};

export default RecommendationCard;
