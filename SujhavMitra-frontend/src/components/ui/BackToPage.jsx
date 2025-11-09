import { Link } from "react-router-dom";

export default function BackToPage({ to = "/", label = "Back" }) {
  // Automatically create a readable label if not explicitly given
  const displayLabel =
    label === "Back" && to !== "/"
      ? `Back to ${to.replace("/", "").charAt(0).toUpperCase() + to.slice(2)}`
      : label;

  return (
    <div className="pagelink mt-4">
      <Link
        to={to}
        className="text-indigo-600 underline hover:text-indigo-800 transition"
      >
        {displayLabel}
      </Link>
    </div>
  );
}
