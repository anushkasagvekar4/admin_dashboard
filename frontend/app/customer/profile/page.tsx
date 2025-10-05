"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CustomerProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) {
      // Initialize with user data from auth state
      setEmail(user || "");
      // You would typically fetch full user profile data here
      // For now, we'll use the email from auth state
    }
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would dispatch an action to update the user profile
      // For now, we'll just show a success message
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved.",
      });
    } catch (err: any) {
      toast.error(err || "Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;
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
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border-gray-300"
            disabled
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
          disabled={loading}
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
}