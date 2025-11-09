import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DEFAULT_SETTINGS = {
  dots: false,
  infinite: true,
  speed: 400,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 1800,
  cssEase: "ease-in-out",
  pauseOnHover: true,
  swipeToSlide: true,
  touchThreshold: 12,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 4 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 1 } },
  ],
};

export default function BaseSlider({
  items,
  renderItem,
  maxSlides = 4,
  settings = {},
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const sliderSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    slidesToShow: Math.min(maxSlides, items.length),
  };

  return (
    <div>
      <Slider {...sliderSettings}>
        {items.map((item, idx) => (
          <div key={item.id || item.isbn || idx} className="px-2">
            {renderItem(item, idx)}
          </div>
        ))}
      </Slider>
    </div>
  );
}
