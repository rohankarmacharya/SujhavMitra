import React, { useState, useEffect } from "react";
import RecommendationCard from "../../components/BookCard";
import SectionHeader from "../../components/SectionHeader";
import SearchBox from "../../components/ui/SearchBox";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Badge from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import useSearch from "../../hooks/useSearch";
import {
  fetchPopularBooks,
  fetchBookRecommendations,
} from "../../services/api";
import Skeleton from "../../components/Skeleton";

export default function DiscoverTab() {
  const [popularBooks, setPopularBooks] = useState([]);

  const {
    query,
    setQuery,
    results: searchResults,
    suggestions,
    loading: searchLoading,
    error: searchError,
    handleSearch,
    handleClear,
    fetchSuggestions,
  } = useSearch({
    fetchRecommendations: fetchBookRecommendations,
    fetchPopularItems: fetchPopularBooks,
    onError: (err) => console.error("Book search error:", err),
  });

  useEffect(() => {
    const loadPopularBooks = async () => {
      try {
        const books = await fetchPopularBooks();
        setPopularBooks(books || []);
      } catch (err) {
        console.error("Error loading popular books:", err);
      }
    };
    loadPopularBooks();
  }, []);

  return (
    <>
      <div className="wrapper pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3">
            <Badge variant="cyan" className="gap-2">
              <span role="img" aria-label="books">
                📚
              </span>
              Discover Books • Get Recommendations you'll love
            </Badge>
          </div>

          <Card className="mb-8">
            <CardContent className="p-5 md:p-6">
              <div>
                <SearchBox
                  query={query}
                  onQueryChange={setQuery}
                  onSearch={handleSearch}
                  onClear={handleClear}
                  loading={searchLoading}
                  placeholder="Enter book title (e.g. 'The Great Gatsby')"
                  suggestions={suggestions}
                  onSuggestionsFetch={fetchSuggestions}
                />
              </div>

              {searchError && (
                <ErrorMessage message={searchError} className="mt-4" />
              )}
            </CardContent>
          </Card>

          {searchLoading && (
            <section className="mb-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`search-skeleton-${i}`} />
                ))}
              </div>
            </section>
          )}

          {searchResults && searchResults.length > 0 && (
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations ({searchResults.length})
                </h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((book, index) => (
                  <RecommendationCard
                    key={book.isbn || `book-${index}`}
                    item={book}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section className="wrapper py-10 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader subtitle="Popular Books" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
            {popularBooks.slice(0, 9).map((book, idx) => (
              <RecommendationCard key={book.isbn || `pb-${idx}`} item={book} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
