"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAllCustomers } from "@/app/features/users/userApi";
// import { getAllCustomers } from "@/app/features/customers/customerApi";

export default function SuperAdminCustomers() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { customers, loading, error } = useSelector(
    (state: RootState) => state.customers // updated slice key
  );

  // 🧩 Fetch all customers on mount
  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  // 🧩 Show error toast
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading) return <p>Loading customers...</p>;
  if (!customers.length) return <p>No customers found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Customers</h1>
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t">
              <td className="p-3">{customer.full_name}</td>
              <td className="p-3">{customer.email}</td>
              <td className="p-3">{customer.phone || "-"}</td>
              <td className="p-3">{customer.address || "-"}</td>
              <td className="p-3 capitalize">{customer.status}</td>
              <td className="p-3">
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/super_admin/customers/${customer.id}`)
                  }
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
