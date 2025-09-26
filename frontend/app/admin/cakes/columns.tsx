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
export type Cake = {
  id: number; // auto-increment in DB
  image: string; // URL or file path
  cakeName: string; // camelCase preferred in TS
  price: number; // decimal/float
  cakeType: string; // admin can add any type
  flavour: string; // free text
  category: string; // admin can add any category
  status: string; // e.g., "active", "inactive", or any other
  createdAt?: Date; // optional timestamps
  updatedAt?: Date;
};

export const columns: ColumnDef<Cake>[] = [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "image",
    header: "Image",
  },
  {
    accessorKey: "cake_name",
    header: "Cake Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "cake_type",
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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
