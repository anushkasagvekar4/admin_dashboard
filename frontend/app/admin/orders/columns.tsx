"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/app/store/Store";
import { updateOrderStatus } from "@/app/features/orders/orderApi";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Order = {
  id: string;
  order_no: number;
  full_name: string;
  email: string;
  address: string;
  phone: string;
  order_date: string;
  status: "Pending" | "Completed" | "Cancelled";
  trackingStatus?: "Order Placed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "order_no",
    header: "OrderNo",
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "order_date",
    header: "Order Date",
  },
  {
    accessorKey: "status",
    header: "Status",
  },

  {
    accessorKey: "trackingStatus",
    header: "Tracking Status",
    cell: ({ row }) => {
      const status = row.getValue("trackingStatus") as string || "Order Placed";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "Delivered" ? "bg-green-100 text-green-800" :
          status === "Out for Delivery" ? "bg-blue-100 text-blue-800" :
          status === "Shipped" ? "bg-purple-100 text-purple-800" :
          status === "Processing" ? "bg-yellow-100 text-yellow-800" :
          status === "Cancelled" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      const dispatch = useDispatch<AppDispatch>();

      const handleStatusUpdate = (newStatus: string) => {
        dispatch(updateOrderStatus({ id: order.id, tracking_status: newStatus }));
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Order Placed")}>
              Order Placed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Processing")}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Shipped")}>
              Shipped
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Out for Delivery")}>
              Out for Delivery
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Delivered")}>
              Delivered
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("Cancelled")}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
