"use client";
import { useEffect, useState } from "react";
import { fetchSuperAdminDashboard } from "@/app/api/dashboardApi";
import {
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  Cake,
  Trophy,
} from "lucide-react";

interface DashboardData {
  totalSales: number;
  totalOrders: number;
  activeShops: number;
  totalCustomers: number;
  topShops: { name: string; sales: number }[];
  topCakes: { name: string; orders: number }[];
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetchSuperAdminDashboard();
        setData(res);
      } catch (err) {
        console.error("❌ Error fetching dashboard:", err);
      }
    };
    loadDashboard();
  }, []);

  if (!data)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading dashboard...
      </div>
    );

  const cards = [
    {
      title: "Total Sales",
      value: `$${data.totalSales.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: "from-green-100 to-green-50",
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      color: "from-blue-100 to-blue-50",
    },
    {
      title: "Active Shops",
      value: data.activeShops,
      icon: <Store className="w-6 h-6 text-purple-600" />,
      color: "from-purple-100 to-purple-50",
    },
    {
      title: "Total Customers",
      value: data.totalCustomers,
      icon: <Users className="w-6 h-6 text-orange-600" />,
      color: "from-orange-100 to-orange-50",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Super Admin Dashboard
      </h1>

      {/* 🧮 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} shadow hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-600">{card.title}</h3>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 🏆 Top Shops */}
        <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center mb-4">
            <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Top Shops</h2>
          </div>
          {data.topShops.length > 0 ? (
            <ul className="space-y-2">
              {data.topShops.map((shop, index) => (
                <li
                  key={index}
                  className="flex justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}. {shop.name}
                  </span>
                  <span className="font-semibold text-green-600">
                    ${shop.sales.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No shop data available.</p>
          )}
        </div>

        {/* 🍰 Top Cakes */}
        <div className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center mb-4">
            <Cake className="w-5 h-5 text-pink-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Top Cakes</h2>
          </div>
          {data.topCakes.length > 0 ? (
            <ul className="space-y-2">
              {data.topCakes.map((cake, index) => (
                <li
                  key={index}
                  className="flex justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}. {cake.name}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {cake.orders} orders
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No cake data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
