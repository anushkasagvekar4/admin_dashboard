import React from "react";
import {
  Heart,
  ShoppingBag,
  Star,
  Clock,
  MapPin,
  Filter,
  Search,
} from "lucide-react";

const CustomerDashboard: React.FC = () => {
  // Mock data - replace with real data from API
  const recentOrders = [
    {
      id: "ORD001",
      shop: "Sweet Paradise",
      cake: "Chocolate Birthday Cake",
      amount: 1200,
      status: "delivered",
      date: "2024-01-15",
      image:
        "https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    },
    {
      id: "ORD002",
      shop: "Cake Magic",
      cake: "Red Velvet Cake",
      amount: 900,
      status: "preparing",
      date: "2024-01-18",
      image:
        "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
    },
  ];

  const featuredCakes = [
    {
      id: 1,
      name: "Premium Chocolate Truffle",
      shop: "Divine Desserts",
      price: 1800,
      rating: 4.8,
      image:
        "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      category: "Birthday",
      isEggless: false,
    },
    {
      id: 2,
      name: "Eggless Vanilla Delight",
      shop: "Sugar Rush",
      price: 1200,
      rating: 4.6,
      image:
        "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      category: "Eggless",
      isEggless: true,
    },
    {
      id: 3,
      name: "Classic Black Forest",
      shop: "Cake Paradise",
      price: 1500,
      rating: 4.9,
      image:
        "https://images.pexels.com/photos/3026810/pexels-photo-3026810.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      category: "Anniversary",
      isEggless: false,
    },
    {
      id: 4,
      name: "Strawberry Cream Cake",
      shop: "Sweet Dreams",
      price: 1400,
      rating: 4.7,
      image:
        "https://images.pexels.com/photos/1721932/pexels-photo-1721932.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
      category: "Fruit",
      isEggless: false,
    },
  ];

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
          src={cake.image}
          alt={cake.name}
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
        <h3 className="font-semibold text-gray-900 mb-1">{cake.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{cake.shop}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-sm text-gray-700 ml-1">{cake.rating}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">₹{cake.price}</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Add to Cart
        </button>
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
              <p className="text-2xl font-bold text-gray-900">
                {recentOrders.length}
              </p>
              <p className="text-gray-600">Recent Orders</p>
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

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Recent Orders
          </h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
            >
              <img
                src={order.image}
                alt={order.cake}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{order.cake}</h3>
                <p className="text-sm text-gray-600">{order.shop}</p>
                <p className="text-sm text-gray-500">
                  Order #{order.id} • {order.date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{order.amount}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "preparing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
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
          {featuredCakes.map((cake) => (
            <CakeCard key={cake.id} cake={cake} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
