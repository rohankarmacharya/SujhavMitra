import React, { useState, useEffect } from "react";
import BookSlider from "../components/BookSlider";
import RecommendationCard from "../components/BookCard";
import Loading from "../components/Loading";
import SectionHeader from "../components/SectionHeader";
import SearchBox from "../components/ui/SearchBox";
import ErrorMessage from "../components/ui/ErrorMessage";
import Badge from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import useSearch from "../hooks/useSearch";
import { fetchPopularBooks, fetchBookRecommendations } from "../services/api";
import { showToast } from "../utils/toast";

export default function Books() {
  const [popularBooks, setPopularBooks] = useState([]);

  const {
    query,
    setQuery,
    results: recommendations,
    suggestions,
    loading,
    error,
    setError,
    handleSearch,
    handleClear,
    fetchSuggestions,
  } = useSearch({
    fetchRecommendations: fetchBookRecommendations,
    fetchPopularItems: fetchPopularBooks,
    onError: (err) => console.error("Book search error:", err),
  });

  // Fetch popular books once
  useEffect(() => {
    const loadPopularBooks = async () => {
      const books = await fetchPopularBooks();
      setPopularBooks(books);
    };
    loadPopularBooks();
  }, []);

  // Toast reminder
  useEffect(() => {
    showToast("You are in Books");
  }, []);

  return (
    <div className="Bookpage pt-10 pb-16">
      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <Badge variant="cyan" className="gap-2">
              <span role="img" aria-label="books">
                📚
              </span>
              You are in Books
            </Badge>
          </div>

          <Card className="mb-8">
            <CardContent className="p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Books
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Search by title to get recommendations powered by your dataset.
              </p>

              <div className="mt-5">
                <SearchBox
                  query={query}
                  onQueryChange={setQuery}
                  onSearch={handleSearch}
                  onClear={handleClear}
                  loading={loading}
                  placeholder="Enter book title (e.g. 'The Great Gatsby')"
                  suggestions={suggestions}
                  onSuggestionsFetch={fetchSuggestions}
                />
              </div>

              {error && <ErrorMessage message={error} className="mt-4" />}
            </CardContent>
          </Card>

          {loading && <Loading />}

          {recommendations && recommendations.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations ({recommendations.length})
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((book, index) => (
                  <RecommendationCard
                    key={book.isbn || `book-${index}`}
                    item={book}
                  />
                ))}
              </div>
            </section>
          )}

          {!loading && recommendations.length === 0 && !error && (
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No recommendations yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try searching for a book title above.
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="wrapper py-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader subtitle="Popular Books" />
          <BookSlider books={popularBooks.slice(0, 15)} />
          {/* Responsive grid using shared Card/Badge */}
          {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.slice(0, 9).map((book, idx) => (
              <RecommendationCard key={book.isbn || `pb-${idx}`} item={book} />
            ))}
          </div> */}
        </div>
      </section>
    </div>
  );
}
