import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchBookById,
  fetchBookByTitle,
  fetchBookRecommendations,
} from "../services/api";
import useWishlist from "../hooks/useWishlist";
import RecommendationCard from "../components/BookCard";
import Loading from "../components/Loading";
import ReadNowButton from "../components/ui/ReadNowButton";

const BookDetails = () => {
  // Support either /book/:isbn or /book/title/:slug
  const { isbn, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [book, setBook] = useState(location.state?.book || null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isSaved, toggle } = useWishlist();

  // When navigating to another book from within BookDetail (e.g., clicking a related book),
  // ensure we immediately reflect the new state payload before the fetch completes.
  useEffect(() => {
    if (location.state && location.state.book) {
      setBook(location.state.book);
      setError("");
    }
  }, [location.state]);

  useEffect(() => {
    if (!isbn && !slug) return;

    let cancelled = false;

    const getBook = async () => {
      try {
        // Show loader only if we don't have state book for immediate display
        setLoading(!book);

        // Always fetch the selected book to ensure we lock onto the new selection
        let fetched;
        if (isbn) {
          fetched = await fetchBookById(isbn);
        } else {
          const decoded = decodeURIComponent(slug).replace(/-/g, " ");
          fetched = await fetchBookByTitle(decoded);
        }
        if (cancelled) return;
        setBook(fetched);

        // Wishlist
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsWishlisted(wishlist.some((b) => b.isbn === fetched?.isbn));

        // Related based on the fetched book's title
        if (fetched?.title) {
          setLoadingRelated(true);
          const recs = await fetchBookRecommendations(fetched.title);
          if (!cancelled) setRelatedBooks(recs || []);
        } else {
          setRelatedBooks([]);
        }
      } catch (err) {
        console.error(err);
        if (!book) setError(err.message || "Failed to fetch book details");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingRelated(false);
        }
      }
    };

    getBook();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isbn, slug]);

  if (loading) return <Loading />;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!book) return <p className="text-center mt-10">Book not found.</p>;

  const saved = isSaved("book", book.isbn || book.title);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 px-4 py-2 rounded bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 hover:bg-cyan-100"
      >
        &larr; Back
      </button>

      {/* Book Info */}
      <div className="mt-2 grid gap-6 md:grid-cols-3">
        {/* Cover */}
        <div className="md:col-span-1">
          <div className="mx-auto w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] rounded-md overflow-hidden aspect-[2/3] bg-gray-100">
            {book.imageurl ? (
              <img
                src={book.imageurl}
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-book.svg";
                }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-500 text-sm">
                No image
              </div>
            )}
          </div>
        </div>
        {/* Details */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
              {book.title}
            </h1>
            <button
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggle("book", book.isbn || book.title, book)}
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
          {book.author && (
            <p className="text-base md:text-lg text-gray-800 mb-1">
              <span className="font-medium text-gray-900">Author:</span>{" "}
              {book.author}
            </p>
          )}
          {book.isbn && <p className="text-gray-600 mb-1">ISBN: {book.isbn}</p>}
          {book.publisher && (
            <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
          )}
          {book.publishdate && (
            <p className="text-gray-600 mb-1">Published: {book.publishdate}</p>
          )}

          {/* Wishlist Button (uses shared useWishlist) */}
          <button
            onClick={() => toggle("book", book.isbn || book.title, book)}
            className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
              saved
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {saved ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
          {/* Read Now */}
          {book.isbn && <ReadNowButton isbn={book.isbn} />}
        </div>
      </div>

      {/* Related Books */}
      <section className="mt-10">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
          Related Books
        </h2>
        {loadingRelated ? (
          <Loading />
        ) : relatedBooks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBooks.map((b, index) => (
              <RecommendationCard key={b.isbn || `rec-${index}`} item={b} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No related books found.</p>
        )}
      </section>
    </div>
  );
};

export default BookDetails;
