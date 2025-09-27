"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Eye, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  fetchShopById,
  fetchShops,
  toggleShopStatus,
} from "@/app/features/super_admin/super_admin_shops/shopsApi";

// ----------------------
// Types
// ----------------------
type FilterType = "all" | "active" | "inactive";
type SortByType = "created_at" | "shopname" | "ownername";

interface Shop {
  id: string;
  shopname: string;
  ownername: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: "active" | "inactive";
}
//admin
export default function AdminShops() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    shops,
    loading,
    error,
    shop: selectedShop,
    pagination,
  } = useSelector((state: RootState) => state.shops);

  // 🔑 Local states
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [open, setOpen] = useState(false);

  // ✅ pagination & sorting state
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortByType>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    dispatch(
      fetchShops({
        page,
        limit: 10,
        search: q,
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, q, filter, sortBy, sortOrder]);

  // ----------------------
  // Status Badge Component
  // ----------------------
  const StatusBadge = ({ status }: { status: "active" | "inactive" }) => {
    const map = {
      active: { label: "Active", variant: "secondary" as const },
      inactive: { label: "Inactive", variant: "destructive" as const },
    };
    return <Badge variant={map[status].variant}>{map[status].label}</Badge>;
  };

  const handleToggle = (id: string) => {
    dispatch(toggleShopStatus(id));
  };

  const handleView = (id: string) => {
    dispatch(fetchShopById(id));
    setOpen(true);
  };

  if (loading) return <p>Loading shops...</p>;
  // if (error) return <p className="text-red-500">{error.message}</p>;

  return (
    <div>
      {/* header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Shops Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Approve, block or view shop details
        </p>
      </div>

      {/* search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search shops or owners..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="inline-flex rounded-md p-1 bg-secondary text-sm">
          {(["all", "active", "inactive"] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`px-3 py-1.5 rounded-md capitalize ${
                filter === f ? "bg-background shadow" : "text-muted-foreground"
              }`}
              onClick={() => {
                setPage(1);
                setFilter(f);
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60">
            <tr>
              {[
                { key: "shopname", label: "Shop" },
                { key: "ownername", label: "Owner" },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
                { key: "address", label: "Address" },
                { key: "city", label: "City" },
                { key: "status", label: "Status" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="text-left p-3 cursor-pointer"
                  onClick={() => {
                    if (
                      col.key === "shopname" ||
                      col.key === "ownername" ||
                      col.key === "created_at"
                    ) {
                      setSortBy(col.key as SortByType);
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }
                  }}
                >
                  {col.label}{" "}
                  {sortBy === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops?.map((s: Shop) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.shopname}</td>
                <td className="p-3">{s.ownername}</td>
                <td className="p-3">{s.phone}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3">{s.address}</td>
                <td className="p-3">{s.city}</td>
                <td className="p-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {s.status === "active" ? (
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleToggle(s.id)}
                      >
                        <PowerOff className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button size="icon" onClick={() => handleToggle(s.id)}>
                        <Power className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleView(s.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* modal for shop details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
          </DialogHeader>

          {!selectedShop ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedShop.shopname}
              </p>
              <p>
                <strong>Owner:</strong> {selectedShop.ownername}
              </p>
              <p>
                <strong>Email:</strong> {selectedShop.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedShop.phone}
              </p>
              <p>
                <strong>Address:</strong> {selectedShop.address},{" "}
                {selectedShop.city}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selectedShop.status} />
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
