"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Cake = {
  id: string;
  cake_name: string;
  cake_type: string;
  flavour: string;
  category: string;
  price: number;
  status: string;
  images: string[];
  created_at?: string;
  updated_at?: string;
};

export const columns = (
  handleView: (cake: Cake) => void,
  handleEdit: (cake: Cake) => void,
  handleDelete: (id: string) => void
): ColumnDef<Cake>[] => [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.original.images || [];
      const firstImage = images[0];
      return (
        <img
          src={firstImage || "/placeholder.jpg"}
          alt="Cake"
          className="w-16 h-16 object-cover rounded-md"
        />
      );
    },
  },
  {
    accessorKey: "cake_name",
    header: "Cake Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "flavour",
    header: "Flavour",
  },
  {
    accessorKey: "price",
    header: "Price (₹)",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(cake)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(cake)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(cake.id)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
