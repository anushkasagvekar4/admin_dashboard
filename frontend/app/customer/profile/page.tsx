"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CustomerProfile() {
  const [name, setName] = useState("Anushka Sagvekar");
  const [email, setEmail] = useState("anushka@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("221B Baker Street, Mumbai");

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile saved", {
      description: "Your changes have been updated.",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Your Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage personal details and delivery address
        </p>
      </div>

      <form onSubmit={onSave} className="grid gap-4 max-w-2xl">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-[100px] rounded-xl border bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button className="h-11 rounded-xl w-fit">Save Changes</Button>
      </form>
    </div>
  );
}
