const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const SEARCH_URL = "https://api.themoviedb.org/3/search/movie";
const IMG_BASE = "https://image.tmdb.org/t/p";

const cache = new Map();

export async function fetchPosterUrlForTitle(title, year, size = "w342") {
  if (!title || !API_KEY) return null;
  const key = `${title}::${year || ""}`.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  try {
    const params = new URLSearchParams({ api_key: API_KEY, query: title });
    if (year) params.set("year", String(year));
    const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("tmdb search failed");
    const data = await res.json();
    const first = Array.isArray(data?.results) ? data.results.find(r => r?.poster_path) || data.results[0] : null;
    const url = first?.poster_path ? `${IMG_BASE}/${size}${first.poster_path}` : null;
    cache.set(key, url);
    return url;
  } catch {
    cache.set(key, null);
    return null;
  }
}
