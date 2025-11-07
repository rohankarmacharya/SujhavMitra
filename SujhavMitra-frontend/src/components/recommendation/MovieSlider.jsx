import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MovieCard from "../MovieCard";

export default function MovieSlider({ movies }) {
  if (!Array.isArray(movies) || movies.length === 0) return null;

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: Math.min(5, movies.length),
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
        {movies.map((m, idx) => (
          <div key={m.id || idx} className="movie-slide px-2">
            <div className="h-full">
              <MovieCard movie={m} />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
