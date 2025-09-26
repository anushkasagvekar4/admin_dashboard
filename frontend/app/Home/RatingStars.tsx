import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number; // 0-5
  size?: number;
  className?: string;
}

export function RatingStars({
  rating,
  size = 16,
  className,
}: RatingStarsProps) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const items = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className={className} aria-label={`Rating: ${rating} out of 5`}>
      {items.map((i) => {
        const filled = i < full || (i === full && half);
        return (
          <Star
            key={i}
            size={size}
            className={
              filled ? "fill-primary text-primary" : "text-muted-foreground"
            }
          />
        );
      })}
    </div>
  );
}
