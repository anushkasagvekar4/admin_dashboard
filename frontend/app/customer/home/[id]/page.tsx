"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { getCakes } from "@/app/features/shop_admin/cakes/cakeApi";
import { addToCart } from "@/app/features/orders/cartSlice";
import { ArrowLeft, ShoppingCart, Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { addToCartAPI } from "@/app/features/orders/cartApi";
import {
  fetchReviewsByCake,
  createReview,
} from "@/app/features/reviews/reviewApi";

export default function CakeDetails() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cakes } = useSelector((state: RootState) => state.cakes);
  const { shops } = useSelector((state: RootState) => state.shops);
  const { role, token } = useSelector((state: RootState) => state.auth);
  const { selectedCustomer } = useSelector((state: RootState) => state.customers);
  const {
    byCakeId,
    loading: reviewsLoading,
    creating: reviewSubmitting,
  } = useSelector((state: RootState) => state.reviews);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (!cakes.length) dispatch(getCakes());
  }, [dispatch, cakes.length]);

  useEffect(() => {
    if (id) {
      dispatch(fetchReviewsByCake(id as string));
    }
  }, [dispatch, id]);

  const cake = cakes.find((c) => c.id === id);
  const shop = shops.find((s) => s.id === id);
  const reviews = cake ? byCakeId[cake.id] || [] : [];

  useEffect(() => {
    if (cake?.images?.length) setSelectedImage(cake.images[0]);
    else setSelectedImage(null);
  }, [cake]);

  if (!cake)
    return (
      <div className="max-w-4xl mx-auto text-center py-20 text-gray-500">
        Loading cake details...
      </div>
    );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
  };

  const handleSubmitReview = async () => {
    if (!cake) return;
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }

    try {
      await dispatch(
        createReview({
          cakeId: cake.id,
          rating,
          comment: comment.trim() || undefined,
        })
      ).unwrap();
      toast.success("Review submitted");
      setRating(0);
      setComment("");
    } catch (err: any) {
      toast.error(
        typeof err === "string" ? err : "Failed to submit review"
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
      >
        <ArrowLeft size={18} /> Back to Shop
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Left: Images */}
        <div className="flex flex-col items-center">
          <div
            className="relative w-full h-96 overflow-hidden rounded-xl bg-gray-50"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={cake.cake_name}
                className="w-full h-full object-cover rounded-xl shadow-md transition-transform duration-200 ease-out cursor-zoom-in"
                style={zoomStyle}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No image available
              </div>
            )}
          </div>

          {cake.images && cake.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {cake.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Cake image ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${
                    selectedImage === img
                      ? "border-blue-600 scale-105"
                      : "border-transparent hover:border-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Cake Info */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cake.cake_name}
            </h1>
            <p className="text-gray-600 mb-4">
              Indulge in our delicious{" "}
              <span className="font-medium">{cake.flavour || "signature"}</span>{" "}
              flavour, crafted with premium ingredients.
            </p>

            <div className="text-3xl font-bold text-blue-700 mb-6">
              ₹{cake.price}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={async () => {
                  // Check if user is authenticated as customer
                  if (!token || role !== 'customer' || !selectedCustomer) {
                    toast.error("Please sign in to add items to cart");
                    router.push('/auth/signin');
                    return;
                  }

                  try {
                    await dispatch(
                      addToCartAPI({
                        cakeId: cake.id,
                        quantity: 1,
                        price: Number(cake.price),
                      })
                    ).unwrap();
                    toast.success("Added to cart");
                  } catch (err) {
                    toast.error("Failed to add to cart");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl text-lg font-medium shadow-md transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>

              <button className="border border-gray-400 text-gray-700 py-3 px-6 rounded-xl text-lg font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2">
                <Heart size={20} /> Add to Wishlist
              </button>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our <span className="font-semibold">{cake.cake_name}</span> is a
                delightful treat made with the finest ingredients. Whether it's{" "}
                <span className="font-medium">
                  {cake.category || "a birthday, anniversary, or celebration"}
                </span>
                , this cake will make your moment extra special. Every layer is
                baked with love, giving you the perfect balance of flavor,
                texture, and sweetness that melts in your mouth.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Handcrafted by our expert bakers at{" "}
                <span className="font-medium">
                  {shop?.shopname || "our bakery"}
                </span>
                , this cake can be customized according to your size and design
                preference. Fresh, soft, and absolutely irresistible!
              </p>
            </div>
            <div className="mt-6 bg-gray-50 rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Customer Reviews
              </h2>
              <div className="flex items-center mb-4">
                <Star className="text-yellow-400 fill-current" size={20} />
                <span className="ml-2 font-semibold">
                  {Number(cake.rating || 0).toFixed(1)} / 5
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({cake.reviews || 0} reviews)
                </span>
              </div>

              {role === "customer" ? (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Write a review
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={20}
                          className={
                            value <= rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full border rounded-lg p-2 text-sm mb-3"
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  Sign in as a customer to write a review.
                </p>
              )}

              {reviewsLoading ? (
                <p className="text-sm text-gray-500">Loading reviews...</p>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              size={16}
                              className={
                                value <= review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {review.customer?.full_name || "Customer"}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
