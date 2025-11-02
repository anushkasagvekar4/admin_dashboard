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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;

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
            {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem>View customer</DropdownMenuItem> */}
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
