import Hero from "../components/Hero";
import PopularBooks from "../components/recommendation/PopularBooks";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";
import MovieSlider from "../components/recommendation/MovieSlider";
import { fetchPopularMovies, fetchPopularBooks, fetchBookRecommendations, fetchMovieRecommendations } from "../services/api";

const Home = () => {
  const { list } = useWishlist();
  const [toast, setToast] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [booksCount, setBooksCount] = useState(0);
  const navigate = useNavigate();
  const [qsType, setQsType] = useState("book");
  const [qsQuery, setQsQuery] = useState("");
  const [qsOpen, setQsOpen] = useState(false);
  const [qsSuggestions, setQsSuggestions] = useState([]);
  const [qsActiveIdx, setQsActiveIdx] = useState(-1);
  const qsInputRef = useRef(null);
  const qsSuggRef = useRef(null);
  const [popularBooksList, setPopularBooksList] = useState([]);
  const qsSuppressRef = useRef(false);

  useEffect(() => {
    const onToast = (e) => {
      const { action, kind, data } = e.detail || {};
      if (!action) return;
      const label = data?.title || data?.name || "Item";
      setToast({ msg: `${label} ${action === "added" ? "added to" : "removed from"} wishlist`, at: Date.now() });
      setTimeout(() => setToast(null), 2200);
    };
    window.addEventListener("wishlist:toast", onToast);
    return () => window.removeEventListener("wishlist:toast", onToast);
  }, []);

  const recent = list.slice(-6).reverse();

  useEffect(() => {
    const load = async () => {
      setLoadingTrending(true);
      try {
        const data = await fetchPopularMovies();
        setTrending(data || []);
        // also load popular books for stats and fallback suggestions
        try {
          const pb = await fetchPopularBooks();
          const list = pb?.popular_books || pb || [];
          setPopularBooksList(Array.isArray(list) ? list : []);
          setBooksCount(Array.isArray(list) ? list.length : (pb?.popular_books?.length || pb?.length || 0));
        } catch {}
      } finally {
        setLoadingTrending(false);
      }
    };
    load();
  }, []);

  // Debounced backend-powered suggestions for Quick Search (starts-with, with fallback)
  useEffect(() => {
    const q = qsQuery.trim();
    if (!q) {
      setQsSuggestions([]);
      setQsOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const low = q.toLowerCase();
        if (qsType === "book") {
          const recs = await fetchBookRecommendations(q);
          const titles = Array.isArray(recs) ? recs.map((r) => r.title).filter(Boolean) : [];
          let uniq = Array.from(new Set(titles)).filter((tt) => tt.toLowerCase().startsWith(low)).slice(0, 8);
          if (uniq.length === 0) {
            const pop = (Array.isArray(popularBooksList) ? popularBooksList : popularBooksList?.popular_books || [])
              .map((b) => b.title || b["Book-Title"]) // normalize
              .filter(Boolean);
            uniq = Array.from(new Set(pop)).filter((tt) => tt.toLowerCase().startsWith(low)).slice(0, 8);
          }
          setQsSuggestions(uniq);
          setQsOpen(uniq.length > 0);
          setQsActiveIdx(-1);
        } else {
          const recs = await fetchMovieRecommendations(q);
          const titles = Array.isArray(recs) ? recs.map((m) => m.title).filter(Boolean) : [];
          let uniq = Array.from(new Set(titles)).filter((tt) => tt.toLowerCase().startsWith(low)).slice(0, 8);
          if (uniq.length === 0) {
            const pop = Array.isArray(trending) ? trending : [];
            const popTitles = pop.map((m) => m.title).filter(Boolean);
            uniq = Array.from(new Set(popTitles)).filter((tt) => tt.toLowerCase().startsWith(low)).slice(0, 8);
          }
          setQsSuggestions(uniq);
          setQsOpen(uniq.length > 0);
          setQsActiveIdx(-1);
        }
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(t);
  }, [qsQuery, qsType, trending, popularBooksList]);

  // Close suggestions on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      const inp = qsInputRef.current;
      const box = qsSuggRef.current;
      if (!inp && !box) return;
      if (inp && inp.contains(e.target)) return;
      if (box && box.contains(e.target)) return;
      setQsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="homepage pb-16">
      <div className="wrapper">
        {/* Hero Section with gradient backdrop */}
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50 via-white to-white" />
          <div className="px-4">
            <div className="mx-auto max-w-6xl py-10">
              <Hero />
              {/* Quick Search */}
              <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
                <form
                  className="relative flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = qsQuery.trim();
                    if (!q) return;
                    setQsOpen(false);
                    setQsSuggestions([]);
                    setQsActiveIdx(-1);
                    qsSuppressRef.current = true;
                    setTimeout(() => {
                      qsSuppressRef.current = false;
                    }, 400);
                    if (qsType === "movie") {
                      navigate("/movies", { state: { prefill: q } });
                    } else {
                      navigate("/books", { state: { prefill: q } });
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${qsType === "book" ? "bg-purple-50 text-purple-700 ring-purple-100" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
                      onClick={() => setQsType("book")}
                    >
                      Books
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${qsType === "movie" ? "bg-purple-50 text-purple-700 ring-purple-100" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
                      onClick={() => setQsType("movie")}
                    >
                      Movies
                    </button>
                  </div>
                  <input
                    className="flex-1 rounded-lg border border-gray-300 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Search ${qsType === "movie" ? "movies" : "books"} (e.g. 'Harry Potter')`}
                    value={qsQuery}
                    onChange={(e) => {
                      setQsQuery(e.target.value);
                      setQsActiveIdx(-1);
                    }}
                    onKeyDown={(e) => {
                      if (!qsOpen || qsSuggestions.length === 0) return;
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setQsActiveIdx((i) => (i + 1) % qsSuggestions.length);
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setQsActiveIdx((i) => (i <= 0 ? qsSuggestions.length - 1 : i - 1));
                      } else if (e.key === "Enter") {
                        const choice = qsActiveIdx >= 0 ? qsSuggestions[qsActiveIdx] : qsQuery.trim();
                        if (choice) {
                          setQsOpen(false);
                          if (qsType === "movie") navigate("/movies", { state: { prefill: choice } });
                          else navigate("/books", { state: { prefill: choice } });
                        }
                      } else if (e.key === "Escape") {
                        setQsOpen(false);
                      }
                    }}
                    ref={qsInputRef}
                    onBlur={() => setTimeout(() => setQsOpen(false), 120)}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={qsOpen}
                    aria-controls="home-sugg-list"
                    aria-activedescendant={qsActiveIdx >= 0 ? `home-sugg-${qsActiveIdx}` : undefined}
                  />
                  {/* Suggestions */}
                  {qsOpen && qsSuggestions.length > 0 && (
                    <div ref={qsSuggRef} className="absolute left-0 right-0 top-full mt-1 rounded-lg border bg-white shadow-lg z-20">
                      <ul id="home-sugg-list" role="listbox" className="max-h-64 overflow-auto py-1 text-sm">
                        {qsSuggestions.map((t, i) => (
                          <li
                            key={`${t}-${i}`}
                            id={`home-sugg-${i}`}
                            role="option"
                            aria-selected={i === qsActiveIdx}
                            className={`cursor-pointer px-3 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${i === qsActiveIdx ? "bg-gray-200" : ""}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setQsOpen(false);
                              if (qsType === "movie") navigate("/movies", { state: { prefill: t } });
                              else navigate("/books", { state: { prefill: t } });
                            }}
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700"
                  >
                    Search
                  </button>
                </form>
                {/* Stats */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Saved: {list.length}</span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Trending movies: {trending.length}</span>
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">Popular books: {booksCount}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Explore Section */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/books" className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-purple-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-purple-600 transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-900">Books</h3>
                    <p className="mt-1 text-sm text-gray-600">Search titles and get smart recommendations.</p>
                  </div>
                  <div className="rounded-full bg-purple-50 p-3 text-purple-700 ring-1 ring-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M11.25 3.75c-2.9 0-5.25 2.35-5.25 5.25v8.25c0 .414.336.75.75.75h6.75a4.5 4.5 0 004.5-4.5V9c0-2.9-2.35-5.25-5.25-5.25h-1.5Z"/></svg>
                  </div>
                </div>
              </Link>
              <Link to="/movies" className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-purple-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-purple-600 transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-purple-900">Movies</h3>
                    <p className="mt-1 text-sm text-gray-600">Browse popular picks and discover related films.</p>
                  </div>
                  <div className="rounded-full bg-purple-50 p-3 text-purple-700 ring-1 ring-purple-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.5 5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25Zm3 2.25a.75.75 0 100 1.5h9a.75.75 0 000-1.5h-9Zm-.75 4.5A.75.75 0 017.5 11.25h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75ZM7.5 15a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9Z"/></svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
        {/* Trending Movies Section */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Trending Movies</h2>
              <Link to="/movies" className="text-sm text-purple-700 hover:underline">See all</Link>
            </div>
            {!loadingTrending && trending.length > 0 && (
              <MovieSlider movies={trending.slice(0, 15)} />
            )}
            {loadingTrending && (
              <p className="text-gray-600">Loading…</p>
            )}
          </div>
        </section>
        {/* Saved Section */}
        <section className="px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Saved</h2>
              <Link to="/profile" className="text-sm text-purple-700 hover:underline">View all</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-gray-600">No saved items yet. Add books or movies to see them here.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map((it) => (
                  <Link
                    key={`${it.kind}-${it.key}`}
                    to={it.kind === "book" && it.data?.isbn ? `/book/${it.data.isbn}` : it.kind === "movie" && it.data?.id ? `/movie/${it.data.id}` : "/profile"}
                    state={{ [it.kind]: it.data }}
                    className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-cyan-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-cyan-600 transform hover:-translate-y-1"
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500">{it.kind}</div>
                    <div className="mt-1 font-semibold text-gray-900 break-words transition-colors group-hover:text-cyan-900">{it.data?.title || it.data?.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Popular books Section */}
        <PopularBooks />
      </div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg">{toast.msg}</div>
      )}
    </div>
  );
};

export default Home;
