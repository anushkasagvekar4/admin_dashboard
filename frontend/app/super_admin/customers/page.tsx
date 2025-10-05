"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getAllCustomers } from "@/app/features/users/userApi";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
}

export default function CustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Fetch all customers on mount
  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  // Show error toast
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
          {customers.map((customer: Customer) => (
            <tr key={customer.id} className="border-t">
              <td className="p-3">{customer.full_name}</td>
              <td className="p-3">{customer.email}</td>
              <td className="p-3">{customer.phone || "-"}</td>
              <td className="p-3">{customer.address || "-"}</td>
              <td className="p-3 capitalize">{customer.status}</td>
              <td className="p-3">
                <Button size="sm" onClick={() => setSelectedCustomer(customer)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
            <p>
              <strong>Name:</strong> {selectedCustomer.full_name}
            </p>
            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer.phone || "-"}
            </p>
            <p>
              <strong>Address:</strong> {selectedCustomer.address || "-"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="capitalize">{selectedCustomer.status}</span>
            </p>

            <Button className="mt-4" onClick={() => setSelectedCustomer(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
