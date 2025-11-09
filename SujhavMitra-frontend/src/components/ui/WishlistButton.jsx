import useWishlist from "../../hooks/useWishlist";

export default function WishlistButton({ type, id, item, className = "" }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(type, id);

  return (
    <button
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(type, id, item);
      }}
      className={`rounded-full p-2 ring-1 transition ${
        saved
          ? "bg-red-50 text-red-600 ring-red-100"
          : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.203 3 12.92 3 10.5 3 8.014 4.99 6 7.5 6c1.473 0 2.77.633 3.5 1.938C11.73 6.633 13.027 6 14.5 6 17.01 6 19 8.014 19 10.5c0 2.42-1.688 4.703-3.989 6.007a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.003-.003.002a.75.75 0 01-.704 0l-.003-.002z" />
      </svg>
    </button>
  );
}
