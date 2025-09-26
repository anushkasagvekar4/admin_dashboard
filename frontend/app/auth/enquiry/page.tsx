"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RootState } from "@/app/store/Store";
import {
  createEnquiry,
  resetEnquiry,
} from "@/app/features/shop_admin/enquiry/enquirySlice";

export default function EnquiryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state: RootState) => state.enquiry);

  const [formData, setFormData] = useState({
    shopname: "",
    ownername: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(createEnquiry(formData))
      .unwrap()
      .then((res) => {
        toast.success("Enquiry submitted successfully!", {
          description: "We will review your enquiry and notify you soon.",
        });
        dispatch(resetEnquiry());
        setFormData({
          shopname: "",
          ownername: "",
          email: "",
          phone: "",
          address: "",
          city: "",
        });
      })
      .catch((err) => {
        toast.error("Failed to submit enquiry", {
          description: err || "Something went wrong",
        });
      });
  };

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-center mb-6">
          Shop Enquiry
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shopname">Shop Name</Label>
            <Input
              id="shopname"
              name="shopname"
              value={formData.shopname}
              onChange={handleChange}
              placeholder="Your shop name"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="ownername">Owner Name</Label>
            <Input
              id="ownername"
              name="ownername"
              value={formData.ownername}
              onChange={handleChange}
              placeholder="Owner full name"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shop address"
              required
              className="w-full border rounded-xl px-3 py-2 h-24"
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            disabled={status === "loading"}
            className="w-full h-11 rounded-xl"
          >
            {status === "loading" ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </form>

        {status === "failed" && (
          <p className="text-red-500 text-center mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
