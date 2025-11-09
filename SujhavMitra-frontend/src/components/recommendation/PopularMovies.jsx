import React, { useEffect, useState } from "react";
import { fetchPopularMovies } from "../../services/api";
import MovieCard from "../MovieCard";
import SectionHeader from "../SectionHeader";
import Skeleton from "../Skeleton";

export default function PopularMovies({ title = "Popular Movies", limit = 9 }) {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(limit);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPopularMovies();
        setPopular(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="wrapper py-10 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader subtitle={title} />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {loading &&
            popular.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`popular-skeleton-${i}`} />
            ))}

          {!loading &&
            popular
              .slice(0, Math.min(visibleCount, popular.length))
              .map((movie, idx) => (
                <MovieCard key={movie.id || idx} movie={movie} />
              ))}
        </div>
      </div>
    </section>
  );
}
