"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createCustomer,
  getMyCustomer,
  updateMyCustomer,
} from "@/app/features/users/userApi";

export default function CustomerProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, role, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user || ""); // ✅ set from Redux auth.user
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || role !== "customer") return;

      try {
        setIsLoading(true);
        const res = await dispatch(getMyCustomer()).unwrap();

        if (res) {
          const c = res;
          console.log("Customer:", c);

          setCustomerId(c.id);
          setFullName(c.full_name || "");
          // ✅ Always prefer customer email, else fallback to logged-in user's email
          setEmail(c.email || user || "");
          setPhone(c.phone || "");
          setAddress(c.address || "");
        } else {
          setEmail(user || "");
        }
      } catch (err) {
        console.log("Error fetching profile:", err);
        setEmail(user || "");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, token, user, role]);

  // ✅ Handle Save (create or update)
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // ✅ Ensure email always comes from Redux, never blank
    const payload = {
      full_name: user || fullName,
      email: user || email,
      phone,
      address,
    };

    console.log("👉 Sending payload:", payload);

    try {
      setIsLoading(true);
      if (customerId) {
        await dispatch(updateMyCustomer(payload)).unwrap();
        toast.success("Profile updated successfully");
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        toast.success("Profile created successfully");
      }
    } catch (err: any) {
      console.error("Error saving profile:", err);
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return <p>Loading profile...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

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
            placeholder="Enter your full name"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            className="h-12 rounded-lg border-gray-300 bg-gray-100 text-gray-600"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-lg border-gray-300"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor="address">Address</Label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-[100px] rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            placeholder="Enter your delivery address"
          />
        </div>

        <Button
          type="submit"
          className="h-12 w-fit px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          disabled={isLoading}
        >
          {customerId ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </div>
  );
}
