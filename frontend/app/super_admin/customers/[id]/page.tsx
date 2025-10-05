"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
// import { getCustomerById } from "@/app/features/customers/customerApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCustomerById } from "@/app/features/users/userApi";

export default function CustomerPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCustomer, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  // 🧩 Fetch customer details
  useEffect(() => {
    if (!id || Array.isArray(id)) return; // ensure id is string

    dispatch(getCustomerById(id))
      .unwrap()
      .catch((err) => toast.error(err || "Failed to fetch customer"));
  }, [id, dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading) return <p>Loading customer...</p>;
  if (!selectedCustomer) return <p>Customer not found.</p>;

  const customer = selectedCustomer;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customer Details</h1>
      <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
        <p>
          <strong>Name:</strong> {customer.full_name}
        </p>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phone || "-"}
        </p>
        <p>
          <strong>Address:</strong> {customer.address || "-"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className="capitalize">{customer.status}</span>
        </p>
      </div>

      <div className="mt-6">
        <Button onClick={() => window.history.back()}>Back</Button>
      </div>
    </div>
  );
}
