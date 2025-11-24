"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Heart, ShoppingBag, Star, Filter, Search, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getCakes } from "@/app/features/shop_admin/cakes/cakeApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { addToCartAPI } from "@/app/features/orders/cartApi";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const CustomerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cakes } = useSelector((state: RootState) => state.cakes);
  const { token, user, role } = useSelector((state: RootState) => state.auth);
  const totalReviews = cakes.reduce(
    (sum, cake) => sum + (cake.reviews || 0),
    0
  );

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [egglessOnly, setEgglessOnly] = useState(false);
  const [flavor, setFlavor] = useState("All");
  const [weight, setWeight] = useState("All");
  const [delivery, setDelivery] = useState("All");
  const [sortBy, setSortBy] = useState("None");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem(`favorites_${user || 'guest'}`) || '[]');
    setFavorites(storedFavorites.map((fav: any) => fav.cakeId));
  }, [user]);

  // Memoized filtered cakes
  const filteredCakes = useMemo(() => {
    let result = cakes;

    // Search filter
    if (searchQuery) {
      result = result.filter(cake => 
        (cake.cake_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        ("Local Bakery").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cake.flavour || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category Filter
    if (selectedCategory !== "All") {
      result = result.filter(cake => cake.category === selectedCategory);
    }

    // Price Filter
    result = result.filter(cake => {
      const price = Number(cake.price);
      return price >= minPrice && price <= maxPrice;
    });

    // Rating Filter
    result = result.filter(cake => (cake.rating || 0) >= minRating);

    // Eggless Filter
    if (egglessOnly) {
      result = result.filter(cake => cake.isEggless);
    }

    // Flavor Filter
    if (flavor !== "All") {
      result = result.filter(cake => cake.flavour === flavor);
    }

    // Cake Weight Filter
    if (weight !== "All") {
      result = result.filter(cake => cake.weight === weight);
    }

    // Delivery Filter
    if (delivery === "Same Day") {
      result = result.filter(cake => cake.sameDayDelivery === true);
    }
    if (delivery === "Midnight") {
      result = result.filter(cake => cake.midnightDelivery === true);
    }

    // Sorting
    if (sortBy === "PriceLow") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "PriceHigh") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "Rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [cakes, searchQuery, selectedCategory, minPrice, maxPrice, minRating, egglessOnly, flavor, weight, delivery, sortBy]);
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMinPrice(0);
    setMaxPrice(2000);
    setMinRating(0);
    setEgglessOnly(false);
    setFlavor("All");
    setWeight("All");
    setDelivery("All");
    setSortBy("None");
  };

  useEffect(() => {
    dispatch(getCakes());
  }, [dispatch]);

  const handleAddToCart = async (cake: any) => {
    // Check if user is authenticated and has customer role
    if (!token || !user || role !== "customer") {
      const result = await Swal.fire({
        title: !token ? "Login Required" : "Access Denied",
        text: !token 
          ? "Please login to add items to your cart." 
          : "Only customers can add items to cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: !token ? "Go to Login" : "OK",
      });

      if (result.isConfirmed && !token) {
        router.push("/auth/signin");
      }
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

      // Show success message
      await Swal.fire({
        title: "Added to Cart!",
        text: `${cake.cake_name} has been added to your cart.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // Redirect to cart page
      router.push("/customer/cart");
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Something went wrong while adding to cart.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleAddToFavorites = (cake: any) => {
    // Get existing favorites
    const existingFavorites = JSON.parse(localStorage.getItem(`favorites_${user || 'guest'}`) || '[]');
    
    // Check if already in favorites
    if (existingFavorites.some((fav: any) => fav.cakeId === cake.id)) {
      // Remove from favorites
      const updatedFavorites = existingFavorites.filter((fav: any) => fav.cakeId !== cake.id);
      localStorage.setItem(`favorites_${user || 'guest'}`, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites.map((fav: any) => fav.cakeId));
      toast.error("Removed from favorites");
      return;
    }

    // Add to favorites
    const favoriteItem = {
      id: `fav_${Date.now()}`,
      cakeId: cake.id,
      cake_name: cake.cake_name,
      price: Number(cake.price),
      image: cake.images?.[0] || "/placeholder.png",
      added_at: new Date().toISOString(),
    };

    const updatedFavorites = [...existingFavorites, favoriteItem];
    localStorage.setItem(`favorites_${user || 'guest'}`, JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites.map((fav: any) => fav.cakeId));
    
    toast.success("Added to favorites!");
  };

  const categories = [
    "All",
    "Birthday",
    "Anniversary",
    "Wedding",
    "Eggless",
    "Sugar Free",
  ];

  const CakeCard = ({ cake }: { cake: any }) => {
    const isFavorite = favorites.includes(cake.id);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          <img
            src={cake.images?.[0] || "/placeholder-cake.jpg"}
            alt={cake.cake_name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* ❤️ Favorite toggle */}
          <button
            onClick={() => handleAddToFavorites(cake)}
            className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition"
          >
            <Heart
              size={16}
              className={isFavorite ? "text-red-500 fill-red-500" : "text-gray-600 hover:text-red-500"}
            />
          </button>

          {cake.isEggless && (
            <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Eggless
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">
            {cake.cake_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Local Bakery
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="text-sm ml-1">{cake.rating || "4.5"}</span>
            </div>
            <span className="text-lg font-bold">₹{cake.price}</span>
          </div>

          <button
            onClick={() => handleAddToCart(cake)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add to Cart
          </button>

          <Link href={`/customer/home/${cake.id}`}>
            <button className="w-full mt-2 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50">
              View Details
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-xl p-8 text-white bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 🎂</h1>
        <p className="text-blue-100 mb-6">
          Discover delicious cakes from the best bakeries in your city
        </p>

        {/* Search */}
        <div className="max-w-md relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for cakes, bakeries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Available Cakes"
          value={cakes.length}
          icon={<ShoppingBag size={32} />}
          color="text-blue-500"
        />
        <StatCard
          label="Favorite Cakes"
          value={favorites.length}
          icon={<Heart size={32} />}
          color="text-red-500"
        />
        <StatCard
          label="Reviews Given"
          value={totalReviews}
          icon={<Star size={32} />}
          color="text-yellow-500"
        />
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold mb-6">Browse by Category</h2>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cakes */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Cakes</h2>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
            <button className="text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      </div>
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50">
          <div className="w-80 bg-white h-full shadow-xl p-6 animate-slide-left overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Advanced Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* PRICE RANGE */}
              <div>
                <h3 className="font-medium mb-2">Price Range (₹)</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span>{minPrice}</span>
                  <span>{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* RATING */}
              <div>
                <h3 className="font-medium mb-2">Minimum Rating</h3>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full border p-2 rounded"
                >
                  <option value="0">Any</option>
                  <option value="4">4 ★ & above</option>
                  <option value="4.5">4.5 ★ & above</option>
                </select>
              </div>

              {/* EGGLESS */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={egglessOnly}
                    onChange={(e) => setEgglessOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Eggless Only</span>
                </label>
              </div>

              {/* FLAVOR */}
              <div>
                <h3 className="font-medium mb-2">Flavor</h3>
                <select
                  value={flavor}
                  onChange={(e) => setFlavor(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option>All</option>
                  <option>Chocolate</option>
                  <option>Vanilla</option>
                  <option>Strawberry</option>
                  <option>Red Velvet</option>
                  <option>Black Forest</option>
                </select>
              </div>

              {/* WEIGHT */}
              <div>
                <h3 className="font-medium mb-2">Weight</h3>
                <select
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option>All</option>
                  <option>0.5 kg</option>
                  <option>1 kg</option>
                  <option>2 kg</option>
                </select>
              </div>

              {/* DELIVERY */}
              <div>
                <h3 className="font-medium mb-2">Delivery</h3>
                <select
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option>All</option>
                  <option>Same Day</option>
                  <option>Midnight</option>
                </select>
              </div>

              {/* SORTING */}
              <div>
                <h3 className="font-medium mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="None">None</option>
                  <option value="PriceLow">Price: Low to High</option>
                  <option value="PriceHigh">Price: High to Low</option>
                  <option value="Rating">Rating</option>
                </select>
              </div>

              {/* CLEAR FILTERS */}
              <button
                onClick={clearFilters}
                className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>

              {/* APPLY */}
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Small reusable stat card */
const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-gray-600">{label}</p>
      </div>
      <div className={color}>{icon}</div>
    </div>
  </div>
);

export default CustomerDashboard;
