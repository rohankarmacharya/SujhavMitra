import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import "./index.css";
import Header from "./components/Header";
import Books from "./pages/Books";
import Footer from "./components/Footer";
import BookDetails from "./pages/BookDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import RecommendationsPage from "./pages/RecommendationsPagee";
import MyRatingsPage from "./pages/MyRatingsPagee";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [toasts, setToasts] = useState([]);
  const lastToastRef = useRef({ msg: "", time: 0 });
  const location = useLocation();

  useEffect(() => {
    const onToast = (e) => {
      const { action, data, variant, timeout, message } = e.detail || {};
      if (!action) return;
      const label =
        message ||
        `${data?.title || data?.name || "Item"} ${
          action === "added" ? "added to" : "removed from"
        } wishlist`;
      const id = Date.now() + Math.random();
      const t = {
        id,
        msg: label,
        variant: variant || (action === "added" ? "success" : "error"),
      };
      setToasts((prev) => [...prev, t]);
      const ttl = typeof timeout === "number" ? timeout : 2800;
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, ttl);
    };
    window.addEventListener("wishlist:toast", onToast);

    // Generic app toasts
    const onAppToast = (e) => {
      const { message, variant, timeout } = e.detail || {};
      if (!message) return;
      // throttle duplicate messages fired close together
      const now = Date.now();
      if (
        lastToastRef.current &&
        lastToastRef.current.msg === message &&
        now - lastToastRef.current.time < 1000
      ) {
        return;
      }
      lastToastRef.current = { msg: message, time: now };
      const id = Date.now() + Math.random();
      const t = { id, msg: message, variant: variant || "info" };
      setToasts((prev) => [...prev, t]);
      const ttl = typeof timeout === "number" ? timeout : 2800;
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== id)),
        ttl
      );
    };
    window.addEventListener("app:toast", onAppToast);

    return () => {
      window.removeEventListener("wishlist:toast", onToast);
      window.removeEventListener("app:toast", onAppToast);
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-300">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/books" element={<Books />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/book/:isbn" element={<BookDetails />} />
        <Route path="/book/title/:slug" element={<BookDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ratings"
          element={
            <ProtectedRoute>
              <MyRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={
                `flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition-all ` +
                (t.variant === "success"
                  ? "border-green-200 bg-white text-green-800"
                  : t.variant === "error"
                  ? "border-red-200 bg-white text-red-800"
                  : t.variant === "info"
                  ? "border-purple-200 bg-white text-purple-800"
                  : "border-gray-200 bg-white text-gray-900")
              }
              style={{ transform: "translateY(0)", opacity: 1 }}
            >
              <div className="mt-0.5">
                {t.variant === "success" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-green-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 0 0-1.06-1.06l-4.72 4.72-1.78-1.78a.75.75 0 1 0-1.06 1.06l2.31 2.31c.293.293.767.293 1.06 0l5.25-5.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : t.variant === "error" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-red-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3.53 6.72a.75.75 0 0 0-1.06-1.06L12 10.44 9.53 7.91a.75.75 0 0 0-1.06 1.06L10.44 12l-1.97 1.97a.75.75 0 1 0 1.06 1.06L12 13.06l2.47 2.47a.75.75 0 1 0 1.06-1.06L13.06 12l2.47-2.47Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-purple-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.75 5.25a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0V7.5Zm.75 9.75a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">{t.msg}</div>
              <button
                aria-label="Close"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 1 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;
