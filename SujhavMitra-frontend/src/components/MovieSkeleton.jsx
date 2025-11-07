export default function MovieSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-md mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full" />
    </div>
  );
}
