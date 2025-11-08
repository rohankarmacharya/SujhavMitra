import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useWishlist from "../hooks/useWishlist";

const tabs = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "movie", label: "Movies" },
];

export default function Wishlist() {
  const { list, remove, fetchWishlist } = useWishlist();
  const [filter, setFilter] = useState("all");
  const [isRemoving, setIsRemoving] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((it) => it.kind === filter);
  }, [list, filter]);

  return (
    <div className="wrapper pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Wishlist</h1>

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
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-600">No items yet. Add some books or movies to your wishlist.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => (
              <div
                key={`${it.kind}-${it.key}`}
                className="group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:bg-gray-100 hover:shadow-xl hover:ring-2 hover:ring-cyan-300 hover:ring-offset-2 focus-within:ring-2 focus-within:ring-cyan-600 transform hover:-translate-y-1"
              >
                {/* Remove button with stopPropagation to prevent triggering the parent click */}
                <div className="absolute right-2 top-2 z-10">
                  <button
                    className={`px-2 py-1 text-xs rounded ring-1 transition-colors ${
                      isRemoving 
                        ? 'bg-gray-100 text-gray-500 ring-gray-200 cursor-not-allowed' 
                        : 'bg-red-50 text-red-600 ring-red-100 hover:bg-red-100'
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      
                      if (isRemoving) return;
                      
                      try {
                        setIsRemoving(true);
                        
                        // Use the item's ID if available, otherwise use the key
                        const itemId = it.id || it.key;
                        
                        if (!itemId) {
                          console.error('No ID or key found for item:', it);
                          return;
                        }
                        
                        // Call the remove function with the item ID
                        const result = await remove(itemId);
                        
                        if (!result.success) {
                          console.error('Failed to remove item:', result.error);
                          // Show error toast
                          window.dispatchEvent(
                            new CustomEvent('toast', {
                              detail: {
                                message: result.error || 'Failed to remove item',
                                type: 'error'
                              }
                            })
                          );
                        } else {
                          // Refresh the wishlist
                          await fetchWishlist();
                          
                          // Show success toast
                          window.dispatchEvent(
                            new CustomEvent('toast', {
                              detail: {
                                message: 'Item removed from wishlist',
                                type: 'success'
                              }
                            })
                          );
                        }
                      } catch (error) {
                        console.error('Error removing item:', error);
                        window.dispatchEvent(
                          new CustomEvent('toast', {
                            detail: {
                              message: error.message || 'An error occurred while removing the item',
                              type: 'error'
                            }
                          })
                        );
                      } finally {
                        setIsRemoving(false);
                      }
                    }}
                    disabled={isRemoving}
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                
                {/* Clickable area for the entire card */}
                <Link
                  to={it.kind === 'book' ? `/book/${it.data?.isbn}` : `/movie/${it.data?.id}`}
                  state={{ 
                    movie: {
                      ...it.data,
                      // Ensure we have all required fields with proper fallbacks
                      id: it.data?.id || it.key,
                      title: it.data?.title || it.data?.name || 'Untitled',
                      overview: it.data?.overview || it.data?.description || 'No overview available.',
                      poster_path: it.data?.poster_path || it.data?.image || null,
                      genres: Array.isArray(it.data?.genres) ? it.data.genres : 
                             (typeof it.data?.genres === 'string' ? it.data.genres.split(',') : []),
                      cast: Array.isArray(it.data?.cast) ? it.data.cast : 
                           (typeof it.data?.cast === 'string' ? it.data.cast.split(',').map(c => c.trim()) : []),
                      crew: it.data?.crew || 'N/A',
                      release_date: it.data?.release_date || it.data?.year || null,
                      vote_average: it.data?.vote_average || it.data?.rating || 0,
                      vote_count: it.data?.vote_count || 0,
                      runtime: it.data?.runtime || null,
                      status: it.data?.status || 'Released',
                      tagline: it.data?.tagline || ''
                    },
                    fromWishlist: true // Flag to indicate this is coming from wishlist
                  }}
                  className="block h-full w-full no-underline"
                >
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-gray-500">{it.kind}</div>
                    <h3 className="font-semibold text-gray-900 break-words group-hover:text-cyan-700">
                      {it.data?.title || it.data?.name}
                    </h3>
                    {it.kind === "book" && (
                      <div className="text-sm text-gray-700">{it.data?.author}</div>
                    )}
                    {it.kind === "movie" && it.data?.genres && (
                      <div className="text-sm text-gray-700">
                        {Array.isArray(it.data.genres) ? it.data.genres.join(", ") : it.data.genres}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
