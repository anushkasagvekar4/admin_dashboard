"use client";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends unknown> {
    // onDelete?: (id: string) => void;
    onToggleStatus?: (id: string, status: "active" | "inactive") => void;
  }
}

interface DataTableProps<T> {
  columns: any;
  data: T[];
  onToggleStatus?: (id: string, status: "active" | "inactive") => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onToggleStatus,
}: DataTableProps<T>) {
  const table = useReactTable<T>({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    meta: { onToggleStatus },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
