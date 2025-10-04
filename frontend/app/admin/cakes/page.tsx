"use client";

import React, { useEffect } from "react";
import { columns, Cake } from "./columns";
import { DataTable } from "./data-table";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { getCakes } from "@/app/features/shop_admin/cakes/cakeApi";

const CakeList = () => {
  const dispatch = useAppDispatch();
  const { cakes, loading, error } = useAppSelector((state) => state.cakes);
  console.log("Raw Cakes from store:", cakes);

  // Fetch cakes on mount
  useEffect(() => {
    dispatch(getCakes());
  }, [dispatch]);

  // Map backend snake_case to frontend camelCase
  const mappedCakes: Cake[] = cakes.map((c: any) => ({
    id: c.id,
    image: c.image,
    cakeName: c.cakeName,
    price: c.price,
    cakeType: c.cakeType,
    flavour: c.flavour,
    category: c.category,
    status: c.status,
    createdAt: c.created_at ? new Date(c.created_at) : undefined,
    updatedAt: c.updated_at ? new Date(c.updated_at) : undefined,
  }));
  console.log("Mapped Cakes:", mappedCakes);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={mappedCakes} />
    </div>
  );
};

export default CakeList;
