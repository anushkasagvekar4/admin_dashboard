"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Eye, PlusCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCake, getCakes } from "@/app/features/shop_admin/cakes/cakeApi";

export default function CakeList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cakes, loading, error } = useSelector(
    (state: RootState) => state.cakes
  );

  const [filter, setFilter] = useState("");
  useEffect(() => {
    dispatch(getCakes()).then(() => {
      console.log("Cakes from API:", cakes);
    });
  }, [dispatch]);

  const handleView = (cake: any) => router.push(`/shop_admin/cakes/${cake.id}`);
  const handleEdit = (cake: any) =>
    router.push(`/shop_admin/cakes/edit/${cake.id}`);
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cake?")) return;
    try {
      await dispatch(deleteCake(id)).unwrap();
      toast.success("Cake deleted successfully!");
      dispatch(getCakes());
    } catch (err: any) {
      toast.error(err || "Failed to delete cake");
    }
  };

  // ✅ Map cakes to simpler structure
  const mappedCakes =
    cakes?.map((cake: any) => ({
      id: cake._id,
      cake_name: cake.cakeName,
      category: cake.category,
      flavour: cake.flavour,
      price: cake.price,
      status: cake.status || "active",
      cake_type: cake.cake_type,
      images: cake.images || [],
    })) || [];

  // ✅ Memoized filtered data for performance
  const filteredCakes = useMemo(() => {
    if (!filter) return mappedCakes;
    return mappedCakes.filter((cake: any) =>
      [cake.cake_name, cake.category, cake.flavour]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(filter.toLowerCase()))
    );
  }, [mappedCakes, filter]);

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cake Management</h1>
          <p className="text-gray-500 text-sm">
            View, edit, or remove cakes from your shop.
          </p>
        </div>

        <Button
          className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white flex items-center gap-2 rounded-xl shadow-md transition cursor-pointer"
          onClick={() => router.push("/admin/add_cakes")}
        >
          <PlusCircle size={20} /> Add New Cake
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search cakes..."
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table / States */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 transition-all">
        {loading ? (
          <p className="text-center text-blue-600 font-medium animate-pulse">
            Loading cakes...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 font-medium">{error}</p>
        ) : filteredCakes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Image</th>
                  <th className="p-3 border">Cake Name</th>
                  <th className="p-3 border">Category</th>
                  <th className="p-3 border">Flavour</th>
                  <th className="p-3 border">Price (₹)</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCakes.map((cake: any) => (
                  <tr
                    key={cake.id || cake._id || Math.random()}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="p-3 border">
                      <img
                        src={cake.images?.[0] || "/placeholder.jpg"}
                        alt="Cake"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    </td>
                    <td className="p-3 border font-semibold text-gray-800">
                      {cake.cake_name}
                    </td>
                    <td className="p-3 border">{cake.category}</td>
                    <td className="p-3 border">{cake.flavour}</td>
                    <td className="p-3 border text-green-600 font-medium">
                      ₹{cake.price?.toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          cake.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {cake.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleView(cake)}
                          title="View"
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <Eye />
                        </button>
                        <button
                          onClick={() => handleEdit(cake)}
                          title="Edit"
                          className="text-green-600 hover:text-green-800 transition"
                        >
                          <Edit />
                        </button>
                        <button
                          onClick={() => handleDelete(cake.id)}
                          title="Delete"
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            🍰 No cakes found. Try adding one!
          </div>
        )}
      </div>
    </div>
  );
}
