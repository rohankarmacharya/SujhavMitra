import BaseSlider from "./ui/BaseSlider";
import MovieCard from "./MovieCard";

export default function MovieSlider({ movies }) {
  return (
    <BaseSlider
      items={movies}
      renderItem={(movie) => (
        <div className="h-full">
          <MovieCard movie={movie} />
        </div>
      )}
    />
  );
}
