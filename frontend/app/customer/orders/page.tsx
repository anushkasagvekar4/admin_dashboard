"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllOrders } from "@/app/features/orders/orderApi";

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>Order #{order.order_no}</CardTitle>
              <CardDescription>
                {order.items && order.items.length > 0
                  ? `Items: ${order.items.map((i) => i.cake?.cake_name || "Item").join(", ")}`
                  : "No items"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="font-semibold mt-1">
                Total: ₹
                {order.items
                  ? order.items.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Order Date: {new Date(order.created_at).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <Link
                href={`/customer/orders/${order.id}`}
                className="text-blue-500 hover:underline"
              >
                Track Order
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
