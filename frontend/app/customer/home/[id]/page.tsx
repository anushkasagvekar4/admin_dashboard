"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { getCakes } from "@/app/features/shop_admin/cakes/cakeApi";
import { addToCart } from "@/app/features/orders/cartSlice";
import { ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { addToCartAPI } from "@/app/features/orders/cartApi";

export default function CakeDetails() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { cakes } = useSelector((state: RootState) => state.cakes);
  const { shops } = useSelector((state: RootState) => state.shops);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!cakes.length) dispatch(getCakes());
  }, [dispatch, cakes.length]);

  const cake = cakes.find((c) => c.id === id);
  const shop = shops.find((s) => s.id === id);

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
          </div>
        </div>
      </div>
    </div>
  );
}
