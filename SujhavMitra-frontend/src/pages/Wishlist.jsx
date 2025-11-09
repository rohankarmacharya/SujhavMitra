import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";
import { Trash2 } from "lucide-react";

const tabs = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "movie", label: "Movies" },
];

export default function Wishlist() {
  const { list, remove, refresh } = useWishlist();
  const [filter, setFilter] = useState("all");
  const [isRemoving, setIsRemoving] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((it) => it.kind === filter);
  }, [list, filter]);

  const handleClearAll = async () => {
    if (isClearing) return;

    try {
      setIsClearing(true);

      // Get items to remove based on current filter
      const itemsToRemove =
        filter === "all" ? list : list.filter((it) => it.kind === filter);

      // Remove all items one by one
      for (const item of itemsToRemove) {
        await remove(item.id);
      }

      // Refresh the wishlist
      await refresh();

      // Close modal
      setShowClearModal(false);

      // Show success message
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            message: `Successfully cleared ${itemsToRemove.length} item${
              itemsToRemove.length !== 1 ? "s" : ""
            } from wishlist`,
            type: "success",
          },
        })
      );
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            message: "Failed to clear wishlist",
            type: "error",
          },
        })
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="wrapper pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Wishlist
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
              {filter !== "all" && ` in ${filter}s`}
            </p>
          </div>

          {/* Clear All Button */}
          {filtered.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 ring-1 ring-red-200 hover:ring-red-300 transition-all"
            >
              <Trash2 size={16} />
              Clear{" "}
              {filter === "all"
                ? "All"
                : `All ${filter === "book" ? "Books" : "Movies"}`}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm ring-1 transition ${
                filter === t.key
                  ? "bg-cyan-50 text-cyan-700 ring-cyan-100"
                  : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
              {t.key === "all" && list.length > 0 && (
                <span className="ml-1 text-xs">({list.length})</span>
              )}
              {t.key === "book" &&
                list.filter((it) => it.kind === "book").length > 0 && (
                  <span className="ml-1 text-xs">
                    ({list.filter((it) => it.kind === "book").length})
                  </span>
                )}
              {t.key === "movie" &&
                list.filter((it) => it.kind === "movie").length > 0 && (
                  <span className="ml-1 text-xs">
                    ({list.filter((it) => it.kind === "movie").length})
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Wishlist Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              {filter === "all"
                ? "No items in your wishlist yet"
                : `No ${filter}s in your wishlist`}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Start adding your favorite{" "}
              {filter === "all" ? "books and movies" : filter + "s"}!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => (
              <div
                key={`${it.kind}-${it.key}`}
                className="group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:bg-gray-100 hover:shadow-xl hover:ring-2 hover:ring-cyan-300 hover:ring-offset-2 focus-within:ring-2 focus-within:ring-cyan-600 transform hover:-translate-y-1"
              >
                {/* Remove button */}
                <div className="absolute right-2 top-2 z-10">
                  <button
                    className={`px-2 py-1 text-xs rounded ring-1 transition-colors ${
                      isRemoving
                        ? "bg-gray-100 text-gray-500 ring-gray-200 cursor-not-allowed"
                        : "bg-red-50 text-red-600 ring-red-100 hover:bg-red-100"
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      if (isRemoving) return;

                      try {
                        setIsRemoving(true);

                        const itemId = it.id || it.key;

                        if (!itemId) {
                          console.error("No ID or key found for item:", it);
                          return;
                        }

                        const result = await remove(itemId);

                        if (!result.success) {
                          console.error("Failed to remove item:", result.error);
                          window.dispatchEvent(
                            new CustomEvent("toast", {
                              detail: {
                                message:
                                  result.error || "Failed to remove item",
                                type: "error",
                              },
                            })
                          );
                        } else {
                          await refresh();
                          window.dispatchEvent(
                            new CustomEvent("toast", {
                              detail: {
                                message: "Item removed from wishlist",
                                type: "success",
                              },
                            })
                          );
                        }
                      } catch (error) {
                        console.error("Error removing item:", error);
                        window.dispatchEvent(
                          new CustomEvent("toast", {
                            detail: {
                              message:
                                error.message ||
                                "An error occurred while removing the item",
                              type: "error",
                            },
                          })
                        );
                      } finally {
                        setIsRemoving(false);
                      }
                    }}
                    disabled={isRemoving}
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </button>
                </div>

                {/* Clickable card */}
                <Link
                  to={
                    it.kind === "book"
                      ? `/book/${it.data?.isbn}`
                      : `/movie/${it.data?.id}`
                  }
                  state={{
                    movie: {
                      ...it.data,
                      id: it.data?.id || it.key,
                      title: it.data?.title || it.data?.name || "Untitled",
                      overview:
                        it.data?.overview ||
                        it.data?.description ||
                        "No overview available.",
                      poster_path:
                        it.data?.poster_path || it.data?.image || null,
                      genres: Array.isArray(it.data?.genres)
                        ? it.data.genres
                        : typeof it.data?.genres === "string"
                        ? it.data.genres.split(",").map((g) => g.trim())
                        : [],
                      cast: Array.isArray(it.data?.cast)
                        ? it.data.cast
                        : typeof it.data?.cast === "string"
                        ? it.data.cast.split(",").map((c) => c.trim())
                        : [],
                      crew: it.data?.crew || "N/A",
                      release_date:
                        it.data?.release_date || it.data?.year || null,
                      vote_average:
                        it.data?.vote_average || it.data?.rating || 0,
                      vote_count: it.data?.vote_count || 0,
                      runtime: it.data?.runtime || null,
                      status: it.data?.status || "Released",
                      tagline: it.data?.tagline || "",
                    },
                    fromWishlist: true,
                  }}
                  className="block h-full w-full no-underline"
                >
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-gray-500">
                      {it.kind === "book" ? "📚 Book" : "🎬 Movie"}
                    </div>
                    <h3 className="font-semibold text-gray-900 break-words group-hover:text-cyan-700">
                      {it.data?.title || it.data?.name}
                    </h3>
                    {it.kind === "book" && it.data?.author && (
                      <div className="text-sm text-gray-700">
                        by {it.data.author}
                      </div>
                    )}
                    {it.kind === "movie" && it.data?.genres && (
                      <div className="text-sm text-gray-700">
                        {Array.isArray(it.data.genres)
                          ? it.data.genres.join(", ")
                          : it.data.genres}
                      </div>
                    )}
                    <div className="text-cyan-700 text-sm font-medium mt-2 inline-flex items-center">
                      View details
                      <svg
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Clear{" "}
                  {filter === "all"
                    ? "All Items"
                    : `All ${filter === "book" ? "Books" : "Movies"}`}
                  ?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove {filtered.length}{" "}
                  {filtered.length === 1 ? "item" : "items"} from your wishlist?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? "Clearing..." : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
