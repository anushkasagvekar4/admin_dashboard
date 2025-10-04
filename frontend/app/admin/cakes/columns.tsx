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

// Frontend Cake type (camelCase)
export type Cake = {
  id: number;
  image: string;
  cakeName: string; // camelCase for frontend
  price: number;
  cakeType: string;
  flavour: string;
  category: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const columns: ColumnDef<Cake>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <img
        src={row.original.image}
        alt={row.original.cakeName}
        className="h-12 w-12 object-cover rounded"
      />
    ),
  },
  {
    accessorKey: "cakeName", // updated to camelCase
    header: "Cake Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `₹${row.original.price}`, // formatted price
  },
  {
    accessorKey: "cakeType", // camelCase
    header: "Cake Type",
  },
  {
    accessorKey: "flavour",
    header: "Flavour",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded text-white ${
          row.original.status === "active" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const cake = row.original;

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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
