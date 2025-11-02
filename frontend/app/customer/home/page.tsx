"use client";
import React, { useEffect } from "react";
import { Heart, ShoppingBag, Star, Filter, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCakes } from "@/app/features/shop_admin/cakes/cakeApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { addToCart } from "@/app/features/orders/cartSlice";
import Link from "next/link";

const CustomerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cakes } = useSelector((state: RootState) => state.cakes);

  useEffect(() => {
    dispatch(getCakes());
  }, [dispatch]);

  const handleAddToCart = (cake: any) => {
    dispatch(
      addToCart({
        id: cake.id,
        cake_name: cake.cake_name || cake.name,
        price: Number(cake.price),
        image: cake.images && cake.images.length ? cake.images[0] : cake.image, // ✅ Use first image
        quantity: 1,
      })
    );
  };

  const categories = [
    "All",
    "Birthday",
    "Anniversary",
    "Wedding",
    "Eggless",
    "Sugar Free",
  ];

  const CakeCard = ({ cake }: { cake: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <img
          src={cake.images && cake.images.length ? cake.images[0] : cake.image} // ✅ First image
          alt={cake.cake_name || cake.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
          <Heart size={16} className="text-gray-600 hover:text-red-500" />
        </button>
        {cake.isEggless && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            Eggless
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">
          {cake.cake_name || cake.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {cake.shop || "Local Bakery"}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm text-gray-700 ml-1">
              {cake.rating || "4.5"}
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900">₹{cake.price}</span>
        </div>
        <button
          onClick={() => handleAddToCart(cake)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add to Cart
        </button>
        <Link href={`/customer/home/${cake.id}`}>
          <button className="w-full mt-2 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-xl p-8 text-white bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 🎂</h1>
        <p className="text-blue-100 mb-6">
          Discover delicious cakes from the best bakeries in your city
        </p>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search for cakes, bakeries..."
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{cakes.length}</p>
              <p className="text-gray-600">Available Cakes</p>
            </div>
            <ShoppingBag className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-gray-600">Favorite Cakes</p>
            </div>
            <Heart className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-gray-600">Reviews Given</p>
            </div>
            <Star className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Browse by Category
        </h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Cakes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured Cakes
          </h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
