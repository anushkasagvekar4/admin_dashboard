"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  createEnquiryAPI,
  checkUserEnquiryStatusAPI,
  EnquiryData,
} from "@/app/features/shop_admin/enquiry/enquiryApi";

export default function EnquiryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EnquiryData>({
    shopname: "",
    ownername: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🟢 Prevent resubmission if user already submitted an enquiry
   */
  // useEffect(() => {
  //   const checkExisting = async () => {
  //     try {
  //       const res = await checkUserEnquiryStatusAPI();
  //       const { hasEnquiry, status } = res.data;

  //       if (hasEnquiry) {
  //         // Redirect based on current enquiry status
  //         if (status === "pending") router.push("/auth/enquiry/enquiry-status");
  //         else if (status === "approved") router.push("/admin/home");
  //         else if (status === "rejected")
  //           router.push("/auth/enquiry/enquiry-status");
  //       }
  //     } catch (err) {
  //       console.warn("No existing enquiry or unauthorized:", err);
  //     }
  //   };

  //   checkExisting();
  // }, [router]);

  /**
   * 🟢 Handle form change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * 🟢 Handle submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createEnquiryAPI(formData);
      toast.success("Enquiry submitted successfully!", {
        description: "We'll notify you once it's reviewed.",
      });

      // ✅ After submission, go to Thank-You page
      router.push("/auth/enquiry/thank-you");
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.message || err.message || "Something went wrong";

      // Handle duplicate enquiry error
      if (message.includes("pending")) {
        router.push("/admin/enquiry-status");
      } else if (message.includes("approved")) {
        router.push("/admin/home");
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold text-center mb-6">
          Shop Registration Enquiry
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Fill in your shop details below to apply for selling on CakeHaven.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Name */}
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

          {/* Owner Name */}
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

          {/* Email */}
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

          {/* Phone */}
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

          {/* Address */}
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

          {/* City */}
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

          <Button disabled={loading} className="w-full h-11 rounded-xl">
            {loading ? "Submitting..." : "Submit Enquiry"}
          </Button>

          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
