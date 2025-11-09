import { useRef, useEffect, useState, useCallback } from "react";

/**
 * Reusable search box component with autocomplete suggestions
 * Used in both Books and Movies pages
 */
export default function SearchBox({
  query,
  onQueryChange,
  onSearch,
  onClear,
  loading = false,
  placeholder = "Enter search term...",
  suggestions = [],
  onSuggestionsFetch,
  disabled = false,
}) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const suggRef = useRef(null);
  const suppressSuggestRef = useRef(false);

  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      onQueryChange(value);
      setActiveIdx(-1);

      if (!value.trim()) {
        setSuggestionsOpen(false);
      }
    },
    [onQueryChange]
  );

  const handleSearch = useCallback(
    (selectedQuery) => {
      setSuggestionsOpen(false);
      setActiveIdx(-1);
      suppressSuggestRef.current = true;
      setTimeout(() => {
        suppressSuggestRef.current = false;
      }, 400);
      onSearch(selectedQuery || query);
    },
    [query, onSearch]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (!suggestionsOpen || suggestions.length === 0) {
        if (e.key === "Enter" && !loading && query.trim()) {
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIdx((i) => (i + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          break;
        case "Enter":
          e.preventDefault();
          const choice = activeIdx >= 0 ? suggestions[activeIdx] : query.trim();
          if (choice) {
            onQueryChange(choice);
            handleSearch(choice);
          }
          break;
        case "Escape":
          setSuggestionsOpen(false);
          break;
      }
    },
    [
      suggestionsOpen,
      suggestions,
      activeIdx,
      loading,
      query,
      handleSearch,
      onQueryChange,
    ]
  );

  // Fetch suggestions (debounced)
  useEffect(() => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setSuggestionsOpen(false);
      return;
    }

    if (suppressSuggestRef.current) {
      setSuggestionsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      if (onSuggestionsFetch) {
        onSuggestionsFetch(searchTerm).then((results) => {
          if (results && results.length > 0) {
            setSuggestionsOpen(true);
            setActiveIdx(-1);
          }
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, onSuggestionsFetch]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        suggRef.current &&
        !suggRef.current.contains(e.target)
      ) {
        setSuggestionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setSuggestionsOpen(false), 120)}
          disabled={disabled || loading}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined
          }
        />

        {/* Suggestions Dropdown */}
        {suggestionsOpen && suggestions.length > 0 && (
          <div
            ref={suggRef}
            className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border bg-white shadow-lg"
          >
            <ul
              id="search-suggestions"
              role="listbox"
              className="max-h-64 overflow-auto py-1 text-sm"
            >
              {suggestions.map((suggestion, i) => (
                <li
                  key={`suggestion-${i}`}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  className={`cursor-pointer px-3 py-2 hover:bg-gray-200 transition-colors ${
                    i === activeIdx ? "bg-gray-200" : ""
                  }`}
                  onClick={() => {
                    onQueryChange(suggestion);
                    handleSearch(suggestion);
                  }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="button"
        className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={loading || !query.trim() || disabled}
        onClick={() => handleSearch()}
      >
        {loading ? "Searching…" : "Search"}
      </button>

      <button
        type="button"
        className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={onClear}
        disabled={loading || disabled}
      >
        Clear
      </button>
    </div>
  );
}
