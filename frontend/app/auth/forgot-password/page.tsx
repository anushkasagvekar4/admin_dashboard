"use client";
import { useState } from "react";
import { forgotPasswordAPI } from "@/app/api/authApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPasswordAPI(email);
      toast.success(res.message || "Reset link sent!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4 text-center">
        Forgot Password
      </h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />
        <Button disabled={loading} type="submit" className="w-full">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}
