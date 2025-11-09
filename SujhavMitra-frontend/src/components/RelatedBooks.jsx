import React from "react";
import Loading from "./Loading";
import RecommendationCard from "./BookCard";
import SectionHeader from "./SectionHeader";

const RelatedBooks = ({ relatedBooks = [], loadingRelated }) => {
  return (
    <section className="mt-10">
      <SectionHeader title="Related Books" />

      {loadingRelated ? (
        <Loading />
      ) : relatedBooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          {relatedBooks.map((b, index) => (
            <RecommendationCard key={b.isbn || `rec-${index}`} item={b} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No related books found.</p>
      )}
    </section>
  );
};

export default RelatedBooks;
