"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const orders = [
  {
    id: 1,
    cakeName: "Chocolate Cake",
    shopName: "Sweet Treats",
    price: 450,
    status: "Delivered",
    date: "2025-09-18",
  },
  {
    id: 2,
    cakeName: "Red Velvet",
    shopName: "Cake House",
    price: 500,
    status: "In Progress",
    date: "2025-09-19",
  },
  {
    id: 3,
    cakeName: "Vanilla Dream",
    shopName: "Sweet Treats",
    price: 350,
    status: "Cancelled",
    date: "2025-09-17",
  },
];

export default function OrdersPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{order.cakeName}</CardTitle>
              <CardDescription>Shop: {order.shopName}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="font-semibold mt-1">Price: ₹{order.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                Order Date: {order.date}
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
