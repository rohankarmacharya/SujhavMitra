import { Link } from "react-router-dom";

const SavedSection = ({ recent }) => {
  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Saved</h2>
          <Link
            to="/profile"
            className="text-sm text-purple-700 hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-gray-600">
            No saved items yet. Add books or movies to see them here.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((it) => (
              <Link
                key={`${it.kind}-${it.key}`}
                to={
                  it.kind === "book" && it.data?.isbn
                    ? `/book/${it.data.isbn}`
                    : it.kind === "movie" && it.data?.id
                    ? `/movie/${it.data.id}`
                    : "/profile"
                }
                state={{ [it.kind]: it.data }}
                className="group rounded-xl border bg-white p-4 shadow-sm transition-all hover:bg-gray-200 hover:shadow-xl hover:ring-2 hover:ring-cyan-300 hover:ring-offset-2 focus-visible:ring-2 focus-visible:ring-cyan-600 transform hover:-translate-y-1"
              >
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  {it.kind}
                </div>
                <div className="mt-1 font-semibold text-gray-900 break-words transition-colors group-hover:text-cyan-900">
                  {it.data?.title || it.data?.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SavedSection;
