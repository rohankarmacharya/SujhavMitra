import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Hero from "../components/Hero";
import PopularBooks from "../components/recommendation/PopularBooks";
import MovieSlider from "../components/MovieSlider";
import SectionHeader from "../components/SectionHeader";
import useWishlist from "../hooks/useWishlist";
import { fetchPopularMovies, fetchPopularBooks } from "../services/api";
import SavedSection from "../components/SavedSection";

const Home = () => {
  const { list } = useWishlist();
  const [toast, setToast] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [popularBooksList, setPopularBooksList] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const onToast = (e) => {
      const { action, data } = e.detail || {};
      if (!action) return;
      const label = data?.title || data?.name || "Item";
      setToast({
        msg: `${label} ${
          action === "added" ? "added to" : "removed from"
        } wishlist`,
      });
      setTimeout(() => setToast(null), 2200);
    };
    window.addEventListener("wishlist:toast", onToast);
    return () => window.removeEventListener("wishlist:toast", onToast);
  }, []);

  const recent = list.slice(-6).reverse();

  useEffect(() => {
    const loadData = async () => {
      setLoadingTrending(true);
      try {
        const movieData = await fetchPopularMovies();
        setTrending(movieData || []);
        const bookData = await fetchPopularBooks();
        const list = bookData?.popular_books || bookData || [];
        setPopularBooksList(Array.isArray(list) ? list : []);
      } finally {
        setLoadingTrending(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="homepage pb-16">
      <Hero />

      <div className="wrapper">
        {/* Saved Section (Now Reusable Component) */}
        {user && user.role_id === 3 && <SavedSection recent={recent} />}

        {/* Explore Section */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/books"
                className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-purple-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-purple-600 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-900">
                      Books
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Search titles and get smart recommendations.
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-50 p-3 text-purple-700 ring-1 ring-purple-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M11.25 3.75c-2.9 0-5.25 2.35-5.25 5.25v8.25c0 .414.336.75.75.75h6.75a4.5 4.5 0 004.5-4.5V9c0-2.9-2.35-5.25-5.25-5.25h-1.5Z" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link
                to="/movies"
                className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-purple-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-purple-600 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-900">
                      Movies
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Browse popular picks and discover related films.
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-50 p-3 text-purple-700 ring-1 ring-purple-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M4.5 5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25Zm3 2.25a.75.75 0 100 1.5h9a.75.75 0 000-1.5h-9Z" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Movies */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              subtitle="Popular Movies"
              title="Discover Trending Films"
              description="Explore the latest and greatest in cinema right now."
            />
            {loadingTrending ? (
              <p className="text-gray-600">Loading…</p>
            ) : trending.length > 0 ? (
              <MovieSlider movies={trending.slice(0, 15)} />
            ) : (
              <p className="text-gray-600">No movies found.</p>
            )}
            <div className="pagelink text-center mt-10">
              <Link to="/movies">View All Movies</Link>
            </div>
          </div>
        </section>

        {/* Popular Books */}
        <section className="popular-books px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <PopularBooks />
            <div className="pagelink text-center mt-10">
              <Link to="/books">View All Books</Link>
            </div>
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg">
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Home;
