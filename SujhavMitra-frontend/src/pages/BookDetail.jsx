import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  fetchBookById,
  fetchBookByTitle,
  fetchBookRecommendations,
} from "../services/api";
import useWishlist from "../hooks/useWishlist";
import Loading from "../components/Loading";
import ReadNowButton from "../components/ui/ReadNowButton";
import WishlistButton from "../components/ui/WishlistButton";
import BackToPage from "../components/ui/BackToPage";
import SectionHeader from "../components/SectionHeader";
import RelatedBooks from "../components/RelatedBooks";

const BookDetails = () => {
  const { user } = useAuth();
  const { isbn, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [book, setBook] = useState(location.state?.book || null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState("");
  const { isSaved, toggle } = useWishlist();

  useEffect(() => {
    if (location.state?.book) {
      setBook(location.state.book);
      setError("");
    }
  }, [location.state]);

  useEffect(() => {
    if (!isbn && !slug) return;

    let cancelled = false;

    const getBook = async () => {
      try {
        setLoading(!book);
        let fetched;
        if (isbn) {
          fetched = await fetchBookById(isbn);
        } else {
          const decoded = decodeURIComponent(slug).replace(/-/g, " ");
          fetched = await fetchBookByTitle(decoded);
        }

        if (cancelled) return;
        setBook(fetched);

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
  }, [isbn, slug]);

  if (loading) return <Loading />;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!book) return <p className="text-center mt-10">Book not found.</p>;

  const saved = isSaved("book", book.isbn || book.title);

  return (
    <div className="wrapper py-8">
      <BackToPage to="/books" />

      <div className="mt-4 bg-white p-6 rounded-lg shadow relative">
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {/* Poster Column */}
          <div className="md:col-span-1 md:sticky md:top-24 self-start">
            <div className="relative mx-auto w-full rounded-md overflow-hidden aspect-[2/3] bg-gray-100">
              <img
                src={book.imageurl}
                alt={book.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <SectionHeader title={book.title} />
              {user && user.role_id === 3 && (
                <WishlistButton
                  type="book"
                  id={book.isbn || book.title}
                  item={book}
                />
              )}
            </div>

            {/* Author */}
            {book.author && (
              <div className="author">
                <p className="text-base md:text-lg text-gray-800 mb-1">
                  <span className="font-medium text-gray-900">Author:</span>{" "}
                  {book.author}
                </p>
              </div>
            )}

            {book.isbn && (
              <p className="text-gray-600 mb-1">ISBN: {book.isbn}</p>
            )}
            {book.publisher && (
              <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
            )}
            {book.publishdate && (
              <p className="text-gray-600 mb-1">
                Published: {book.publishdate}
              </p>
            )}

            {book.isbn && <ReadNowButton isbn={book.isbn} />}
          </div>
        </div>
      </div>

      {/* ✅ Reusable Related Books Component */}
      <RelatedBooks
        relatedBooks={relatedBooks}
        loadingRelated={loadingRelated}
      />
    </div>
  );
};

export default BookDetails;
