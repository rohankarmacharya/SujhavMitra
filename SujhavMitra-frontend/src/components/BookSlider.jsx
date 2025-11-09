import { Link } from "react-router-dom";
import BaseSlider from "./ui/BaseSlider";

export default function BookSlider({ books }) {
  const renderBook = (book) => {
    const content = (
      <div className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-lg">
        <div className="relative overflow-hidden bg-gray-100 aspect-[2/3]">
          <img
            src={book.imageurl}
            alt={book.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-book.svg";
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
        </div>
        <div className="p-3">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 break-words">
            {book.title}
          </h3>
        </div>
      </div>
    );

    if (book.isbn) {
      return (
        <Link to={`/book/${book.isbn}`} state={{ book }}>
          {content}
        </Link>
      );
    }

    return <div className="opacity-80">{content}</div>;
  };

  return <BaseSlider items={books} renderItem={renderBook} />;
}
