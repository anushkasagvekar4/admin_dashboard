"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllOrders, fetchShopOrders } from "@/app/features/orders/orderApi";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const Orders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );
  const { role } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Use shop-specific orders for shop admins, all orders for super admins
    if (role === "shop_admin") {
      dispatch(fetchShopOrders());
    } else {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, role]);

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
        <p>Error: {typeof error === 'string' ? error : (error as any)?.message || 'An error occurred'}</p>
      </div>
    );
  }

  // Transform orders to match the table format
  const tableData = orders.map((order) => ({
    id: order.id,
    order_no: order.orderNo || order.orderNo,
    full_name: order.customer?.full_name || "N/A",
    email: order.customer?.email || "N/A",
    address: "N/A", // Add delivery address to order model if needed
    phone: order.customer?.phone || "N/A",
    order_date: new Date(order.createdAt || order.createdAt).toLocaleDateString(),
    status: order.status,
    trackingStatus: order.trackingStatus || "Order Placed",
  }));

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">
        {role === "shop_admin" ? "My Shop Orders" : "All Orders"}
      </h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {role === "shop_admin" 
              ? "No orders found for your shop. Once customers start ordering your cakes, they will appear here."
              : "No orders found."
            }
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={tableData} />
      )}
    </div>
  );
};

export default Orders;
