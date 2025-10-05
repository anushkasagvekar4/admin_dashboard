"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export type Cake = {
  id: string; // auto-increment in DB
  image: string; // URL or file path
  cakeName: string; // camelCase preferred in TS
  price: number; // decimal/float
  cakeType: string; // admin can add any type
  flavour: string; // free text
  category: string; // admin can add any category
  status?: "active" | "inactive";
  createdAt?: Date; // optional timestamps
  updatedAt?: Date;
};

export const columns = ({
  handleView,
  handleEdit,
  handleDelete,
  handleToggleStatus, // 👈 add this
}: {
  handleView: (cake: Cake) => void;
  handleEdit: (cake: Cake) => void;
  handleDelete: (id: string) => void;
  handleToggleStatus: (id: string) => void; // 👈 add this
}): ColumnDef<Cake>[] => [
  {
    accessorKey: "id",
    header: "id",
  },

  {
    id: "image",
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original.image;
      return (
        <img
          src={
            image.startsWith("http")
              ? image
              : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image}`
          }
          alt={row.original.cakeName}
          className="w-19 h-16 object-cover rounded-md"
        />
      );
    },
  },

  {
    accessorKey: "cakeName",
    header: "Cake Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "cakeType",
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

            {/* Toggle Active/Inactive */}
            <DropdownMenuItem
              onClick={() => {
                if (!cake.id) return;
                handleToggleStatus(cake.id);
              }}
            >
              {cake.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleDelete(cake.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
