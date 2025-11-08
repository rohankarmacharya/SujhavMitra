// Header.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import "../index.css";
import { useAuth } from "../context/useAuth";
import useWishlist from "../hooks/useWishlist";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about-us" },
  { name: "Books", path: "/books" },
  { name: "Movies", path: "/movies" },
];

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const { list, count } = useWishlist();
  const [wlOpen, setWlOpen] = useState(false);
  const wlRef = useRef(null);

  // Add conditional nav items
  const dynamicNav = [...navItems];
  if (user) {
    if (user.role_id === 1 || user.role_id === 2) {
      dynamicNav.push({ name: "Dashboard", path: "/dashboard" });
    } else {
      dynamicNav.push({ name: "Wishlist", path: "/profile" });
    }
  }

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (menuOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // close wishlist dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!wlRef.current) return;
      if (!wlRef.current.contains(e.target)) setWlOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Handle wishlist item click
  const handleWishlistItemClick = (item) => {
    setWlOpen(false);

    if (item.kind === "book") {
      const bookData = {
        ...item.data,
        isbn: item.data?.isbn || item.key,
        title: item.data?.title || "Untitled",
        author: item.data?.author || "Unknown Author",
      };

      if (item.data?.isbn || item.key) {
        navigate(`/book/${item.data?.isbn || item.key}`, {
          state: { book: bookData },
        });
      }
    } else if (item.kind === "movie") {
      const movieData = {
        ...item.data,
        id: item.data?.id || item.key,
        title: item.data?.title || item.data?.name || "Untitled",
        overview: item.data?.overview || item.data?.description || "",
        poster_path: item.data?.poster_path || item.data?.image || null,
        genres: Array.isArray(item.data?.genres)
          ? item.data.genres
          : typeof item.data?.genres === "string"
          ? item.data.genres.split(",").map((g) => g.trim())
          : [],
        cast: Array.isArray(item.data?.cast)
          ? item.data.cast
          : typeof item.data?.cast === "string"
          ? item.data.cast.split(",").map((c) => c.trim())
          : [],
        release_date: item.data?.release_date || item.data?.year || null,
        vote_average: item.data?.vote_average || item.data?.rating || 0,
      };

      if (item.data?.id || item.key) {
        navigate(`/movie/${item.data?.id || item.key}`, {
          state: { movie: movieData },
        });
      }
    }
  };

  return (
    <header className="bg-white shadow-md py-4 z-40 relative">
      <div className="wrapper">
        <div className="mx-auto flex justify-between items-center px-4">
          {/* Logo */}
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <img src={assets.logo} alt="logo" className="h-8" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex gap-8">
            {dynamicNav.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`hover:text-cyan-600 text-black transition-colors ${
                  pathname === item.path ? "font-bold text-cyan-600" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wishlist + Auth Section */}
          <div className="flex gap-4 items-center">
            {/* Wishlist quick */}
            <div className="relative" ref={wlRef}>
              <button
                className="relative rounded-full p-2 ring-1 ring-gray-200 hover:bg-rose-50 hover:ring-rose-200 hover:scale-110 transition-all duration-200"
                onClick={() => setWlOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={wlOpen}
                aria-label={`Wishlist (${count} items)`}
              >
                <span className="sr-only">Open wishlist</span>
                {/* Heart icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={`h-6 w-6 ${
                    wlOpen ? "text-rose-600" : "text-gray-700"
                  } hover:text-rose-600 transition-colors`}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
              {/* Dropdown */}
              {wlOpen && (
                <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1rem)] rounded-xl border bg-white p-3 shadow-xl z-50">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold text-gray-900">Wishlist</div>
                    <Link
                      to="/profile"
                      className="text-xs text-cyan-700 hover:underline"
                      onClick={() => setWlOpen(false)}
                    >
                      View all
                    </Link>
                  </div>
                  {list.length === 0 ? (
                    <div className="text-sm text-gray-600 py-4 text-center">
                      No items yet.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100 max-h-80 overflow-auto pr-1">
                      {list.slice(0, 6).map((it) => (
                        <li key={`${it.kind}-${it.key}`} className="group">
                          <button
                            onClick={() => handleWishlistItemClick(it)}
                            className="w-full text-left block px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-50 group-hover:bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium uppercase text-gray-500 mb-0.5">
                                  {it.kind === "book" ? "📚 Book" : "🎬 Movie"}
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate group-hover:text-cyan-600 transition-colors">
                                  {it.data?.title ||
                                    it.data?.name ||
                                    "Untitled"}
                                </div>
                                {it.kind === "book" && it.data?.author && (
                                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                                    by {it.data.author}
                                  </div>
                                )}
                                {it.kind === "movie" &&
                                  it.data?.release_date && (
                                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                                      {new Date(
                                        it.data.release_date
                                      ).getFullYear()}
                                    </div>
                                  )}
                              </div>
                              <div className="ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="h-4 w-4 text-gray-400 group-hover:text-cyan-500 transition-colors"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                      {list.length > 6 && (
                        <li className="pt-2">
                          <Link
                            to="/profile"
                            onClick={() => setWlOpen(false)}
                            className="block text-center text-xs text-cyan-700 hover:underline py-1"
                          >
                            View {list.length - 6} more items
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <>
                <span className="text-gray-700 text-sm hidden sm:inline">
                  Hi,{" "}
                  {(() => {
                    const full = user.full_name || user.fullName || user.name;
                    const first = user.first_name || user.firstName;
                    const last = user.last_name || user.lastName;
                    const email = user.email || user.username || "";
                    if (full && typeof full === "string") return full;
                    if (first || last)
                      return [first, last].filter(Boolean).join(" ");
                    if (typeof email === "string" && email.includes("@")) {
                      const local = email.split("@")[0].replace(/[0-9]+$/g, "");
                      const parts = local.split(/[._-]+/).filter(Boolean);
                      if (parts.length > 0) {
                        return parts
                          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                          .join(" ");
                      }
                      return local.charAt(0).toUpperCase() + local.slice(1);
                    }
                    return "User";
                  })()}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-cyan-500 text-white px-3 py-1 rounded hover:bg-cyan-600 text-sm transition-colors hidden sm:inline-block"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="border border-cyan-500 text-cyan-500 px-3 py-1 rounded hover:bg-cyan-50 text-sm transition-colors hidden sm:inline-block"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            aria-label="Open menu"
            className="sm:hidden text-gray-800"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Right Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[85%] bg-white shadow-2xl
        transform transition-transform duration-300
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {user && (
            <span className="text-gray-700 text-sm font-medium">
              {user.name || user.email?.split("@")[0] || "User"}
            </span>
          )}
          <button
            ref={closeBtnRef}
            aria-label="Close menu"
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onClick={() => setMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            {dynamicNav.map((item, i) => (
              <li
                key={item.name}
                className={`transform transition duration-300 ${
                  menuOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-6 opacity-0"
                }`}
                style={{ transitionDelay: `${80 + i * 40}ms` }}
              >
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-base
                    hover:bg-cyan-50 hover:text-cyan-700 transition-colors
                    ${
                      pathname === item.path
                        ? "bg-cyan-50 text-cyan-700 font-semibold"
                        : "text-gray-800"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Auth Buttons */}
          {!user && (
            <div className="mt-6 space-y-2 px-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-cyan-500 text-white px-4 py-2 rounded text-center hover:bg-cyan-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block w-full border border-cyan-500 text-cyan-500 px-4 py-2 rounded text-center hover:bg-cyan-50 transition-colors"
              >
                Signup
              </Link>
            </div>
          )}
        </nav>
      </aside>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
