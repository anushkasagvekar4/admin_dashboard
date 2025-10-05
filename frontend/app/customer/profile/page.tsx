"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCustomerById, updateCustomer } from "@/app/features/users/userApi";
// import {
//   updateCustomer,
//   getCustomerById,
// } from "@/app/features/customers/customerApi";

interface Props {
  customerId: string; // renamed for clarity
}

export default function CustomerProfile({ customerId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCustomer, loading, error } = useSelector(
    (state: RootState) => state.customers
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // 🧩 Fetch customer details on mount
  useEffect(() => {
    if (!customerId) return;
    dispatch(getCustomerById(customerId));
  }, [customerId, dispatch]);

  // 🧩 Populate form when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      setFullName(selectedCustomer.full_name || "");
      setEmail(selectedCustomer.email || "");
      setPhone(selectedCustomer.phone || "");
      setAddress(selectedCustomer.address || "");
    }
  }, [selectedCustomer]);

  // 🧩 Handle Save
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      await dispatch(
        updateCustomer({
          id: selectedCustomer.id,
          data: { full_name: fullName, email, phone, address },
        })
      ).unwrap();

      toast.success("Profile updated successfully", {
        description: "Your changes have been saved.",
      });
    } catch (err: any) {
      toast.error(err || "Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!selectedCustomer) return <p>Customer not found.</p>;

  // ✅ Customers can only edit their own profile
  const canEdit = true; // since backend already restricts by auth_id in controller

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
      <p className="text-gray-500 mb-6">
        Manage your personal information and delivery address.
      </p>

      <form onSubmit={onSave} className="grid gap-5">
        <div className="grid gap-1">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 rounded-lg border-gray-300"
            disabled={!canEdit}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border-gray-300"
            disabled={!canEdit}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-lg border-gray-300"
            disabled={!canEdit}
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="address">Address</Label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-[100px] rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            disabled={!canEdit}
          />
        </div>

        {canEdit && (
          <Button
            type="submit"
            className="h-12 w-fit px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            Save Changes
          </Button>
        )}
      </form>
    </div>
  );
}
