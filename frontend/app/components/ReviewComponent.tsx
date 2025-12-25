"use client";
import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createReview, fetchReviewsByCake } from "@/app/features/reviews/reviewApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReviewComponentProps {
  cakeId: string;
  cakeName: string;
  rating?: number;
  reviewCount?: number;
  showWriteReview?: boolean;
}

export default function ReviewComponent({ 
  cakeId, 
  cakeName, 
  rating = 0, 
  reviewCount = 0, 
  showWriteReview = true 
}: ReviewComponentProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { token, role } = useSelector((state: RootState) => state.auth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!token || role !== "customer") {
      toast.error("Only customers can write reviews");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createReview({
        cakeId,
        rating: userRating,
        comment: comment.trim() || undefined
      })).unwrap();
      
      toast.success("Review submitted successfully!");
      setUserRating(0);
      setComment("");
      setIsDialogOpen(false);
      
      // Refresh reviews for this cake
      dispatch(fetchReviewsByCake(cakeId));
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    interactive = false, 
    size = "sm" 
  }: { 
    rating: number; 
    interactive?: boolean; 
    size?: "sm" | "md" | "lg" 
  }) => {
    const starSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={`${
              star <= (interactive ? hoveredStar || rating : rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => {
              if (interactive) setUserRating(star);
            }}
            onMouseEnter={() => {
              if (interactive) setHoveredStar(star);
            }}
            onMouseLeave={() => {
              if (interactive) setHoveredStar(0);
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StarRating rating={rating} />
        <span className="text-sm text-muted-foreground">
          {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {showWriteReview && token && role === "customer" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Review {cakeName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex justify-center">
                  <StarRating rating={userRating} interactive size="lg" />
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                  Comment (optional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this cake..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || userRating === 0}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
