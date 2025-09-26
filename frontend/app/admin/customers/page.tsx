"use client";

import { fetchUsers, updateUserStatus } from "@/app/features/users/userApi";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading, error, pagination } = useAppSelector(
    (state) => state.users
  );

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const fetchData = () => {
    dispatch(fetchUsers({ page, limit, search, sortBy, order }));
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, sortBy, order]);

  // const handleDelete = (id: string) => {
  //   dispatch(deleteUser(id)).then(() => fetchData());
  // };
  const handleToggleStatus = (id: string, status: "active" | "inactive") => {
    dispatch(updateUserStatus({ id, status })).then(() => fetchData());
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap  justify-between  gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by email, full name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="created_at">Created At</option>
            <option value="full_name">Full Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>

          {/* Order */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
            className="border px-2 py-1 rounded"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users || []} // ✅ make sure it's always an array
        onToggleStatus={handleToggleStatus}
      />

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <p>
          Page {pagination.page} of {pagination.totalPages}
        </p>
        <Button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
