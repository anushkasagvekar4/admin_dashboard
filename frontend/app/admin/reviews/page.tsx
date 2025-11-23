"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllReviews } from "@/app/features/reviews/reviewApi";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { all: reviews, loading, error } = useSelector(
    (state: RootState) => state.reviews
  );

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Cake</th>
                <th className="p-3 border">Customer</th>
                <th className="p-3 border">Rating</th>
                <th className="p-3 border">Comment</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    {review.cake?.cake_name || "-"}
                  </td>
                  <td className="p-3 border">
                    {review.customer?.full_name || "Customer"}
                  </td>
                  <td className="p-3 border">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={14}
                          className={
                            value <= review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-2">{review.rating}</span>
                    </div>
                  </td>
                  <td className="p-3 border max-w-xs">
                    {review.comment || "-"}
                  </td>
                  <td className="p-3 border">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
