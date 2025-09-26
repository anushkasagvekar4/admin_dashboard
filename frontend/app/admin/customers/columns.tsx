"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

export type Customer = {
  id: string;
  full_name: string;
  email: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
};

export const columns: ColumnDef<Customer>[] = [
  // {
  //   accessorKey: "id",
  //   header: "id",
  // },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const { id, status } = row.original;

      return (
        <Button
          size="sm"
          variant={status === "active" ? "secondary" : "default"}
          onClick={() =>
            table.options.meta?.onToggleStatus?.(
              id,
              status === "active" ? "inactive" : "active"
            )
          }
        >
          {status === "active" ? "Deactivate" : "Activate"}
        </Button>
      );
    },
  },
];
