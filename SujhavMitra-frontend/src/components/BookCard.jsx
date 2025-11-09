import { Link } from "react-router-dom";
import WishlistButton from "./ui/WishlistButton";

const RecommendationCard = ({ item }) => {
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
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            type="book"
            id={item.isbn || item.title}
            item={item}
          />
        </div>
      </div>

      {/*Text content */}
      <div className="card-content">
        <h2 title={item.title}>{item.title}</h2>
        {item.author && <p>Author: {item.author}</p>}
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
