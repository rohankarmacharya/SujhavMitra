import { useEffect, useState } from "react";
import RecommendationCard from "../RecommendationCard";
import SectionHeader from "../SectionHeader";
import { fetchPopularBooks } from "../../services/api";
import "../../index.css";
import BookSlider from "../BookSlider";

const PopularBooks = () => {
  const [popularBooks, setPopularBooks] = useState([]);

  useEffect(() => {
    const getPopularBooks = async () => {
      const books = await fetchPopularBooks();
      setPopularBooks(books);
    };
    getPopularBooks();
  }, []);

  const list = Array.isArray(popularBooks)
    ? popularBooks
    : Array.isArray(popularBooks?.popular_books)
    ? popularBooks.popular_books
    : [];

  return (
    <div className="PopularBooks">
      <div className="wrapper">
        <div className="px-4 py-12 mx-auto max-w-6xl">
          <SectionHeader
            subtitle="Popular Books"
            title="Discover Your Next Read"
            description="Explore the books everyone is talking about! From gripping thrillers to heartwarming stories."
          />

          {/* Compact slider */}
          {list.length > 0 && (
            <div className="mb-10">
              <BookSlider books={list.slice(0, 12)} />
            </div>
          )}

          {/* Responsive grid using shared Card/Badge */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(0, 9).map((book, idx) => (
              <RecommendationCard key={book.isbn || `pb-${idx}`} item={book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularBooks;
