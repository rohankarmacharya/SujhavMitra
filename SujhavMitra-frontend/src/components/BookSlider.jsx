import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function BookSlider({ books }) {
  if (!Array.isArray(books) || books.length === 0) return null;

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: Math.min(5, books.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1800,
    cssEase: "ease-in-out",
    pauseOnHover: true,
    swipeToSlide: true,
    touchThreshold: 12,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div>
      <Slider {...settings}>
        {books.map((book, index) => (
          <div key={book.isbn || index} className="book-slide px-2">
            {book.isbn ? (
              <Link
                to={`/book/${book.isbn}`}
                state={{ book }}
                className="group block overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-[2/3]">
                  <img
                    src={book.imageurl || (book.isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-L.jpg` : "/placeholder-book.svg")}
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
              </Link>
            ) : (
              <div className="group overflow-hidden rounded-lg border bg-white shadow-sm opacity-80 transition hover:shadow-lg">
                <div className="relative overflow-hidden bg-gray-100 aspect-[2/3]">
                  <img
                    src={book.imageurl || "/placeholder-book.svg"}
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
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
}
