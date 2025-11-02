"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllOrders } from "@/app/features/orders/orderApi";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const Orders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Loading orders...</p>
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

  // Transform orders to match the table format
  const tableData = orders.map((order) => ({
    id: order.id,
    order_no: order.order_no,
    full_name: order.customer?.full_name || "N/A",
    email: order.customer?.email || "N/A",
    address: "N/A", // Add delivery address to order model if needed
    phone: order.customer?.phone || "N/A",
    order_date: new Date(order.created_at).toLocaleDateString(),
    status: order.status,
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      <DataTable columns={columns} data={tableData} />
    </div>
  );
};

export default Orders;
