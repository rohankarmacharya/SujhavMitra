/**
 * Reusable error message component
 * Consistent error display across the app
 */
export default function ErrorMessage({
  title = "Error",
  message,
  className = "",
}) {
  if (!message) return null;

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="text-red-800 font-medium">{title}</div>
      <div className="text-red-700 text-sm mt-1">{message}</div>
    </div>
  );
}
