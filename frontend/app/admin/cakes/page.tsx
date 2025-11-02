"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteCake, getCakes } from "@/app/features/shop_admin/cakes/cakeApi";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";

export default function CakeList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cakes, loading, error } = useSelector(
    (state: RootState) => state.cakes
  );

  useEffect(() => {
    if (!cakes || cakes.length === 0) {
      dispatch(getCakes());
    }
  }, [dispatch, cakes]);

  // Handlers for actions
  const handleView = (cake: any) => {
    router.push(`/shop_admin/cakes/${cake.id}`); // or modal view
  };

  const handleEdit = (cake: any) => {
    router.push(`/shop_admin/cakes/edit/${cake.id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this cake?");
    if (!confirmDelete) return;

    try {
      await dispatch(deleteCake(id)).unwrap();
      toast.success("Cake deleted successfully!");
      dispatch(getCakes());
    } catch (err: any) {
      toast.error(err || "Failed to delete cake");
    }
  };

  const mappedCakes =
    cakes?.map((cake: any) => ({
      id: cake._id,
      cake_name: cake.cake_name,
      category: cake.category,
      flavour: cake.flavour,
      price: cake.price,
      status: cake.status || "active",
      cake_type: cake.cake_type,
      images: cake.images || [],
    })) || [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Cake List</h1>

        {/* <Button
          className="rounded-xl h-11 cursor-pointer"
          onClick={() => router.push("/admin/add_cakes")}
        >
          <Plus size={30} /> Add New Cake
        </Button> */}
      </div>

      {loading ? (
        <p className="text-center text-blue-600">Loading cakes...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : mappedCakes.length > 0 ? (
        <DataTable
          columns={columns(handleView, handleEdit, handleDelete)}
          data={mappedCakes}
        />
      ) : (
        <p className="text-center text-gray-500">No cakes found.</p>
      )}
    </div>
  );
}
