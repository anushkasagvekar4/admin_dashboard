"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { resetPasswordAPI } from "@/app/api/authApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token } = useParams(); // ✅ token from URL path
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email"); // ✅ from query string

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeEmail = typeof email === "string" ? email : email?.[0] || "";
    const safeToken = typeof token === "string" ? token : token?.[0] || "";

    console.log("email:", safeEmail);
    console.log("token:", safeToken);

    if (!safeEmail || !safeToken) {
      toast.error("Invalid or expired reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      console.log("📨 Sending reset request:", {
        safeEmail,
        safeToken,
        newPassword,
      });
      const res = await resetPasswordAPI(safeEmail, safeToken, newPassword);
      console.log("✅ Response:", res);
      toast.success(res.message || "Password reset successful!");
      router.push("/auth/signin");
    } catch (err: any) {
      console.error("❌ Reset error:", err);
      toast.error(
        err?.response?.data?.message || err.message || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-xl font-semibold mb-4 text-center">Reset Password</h1>
      <form onSubmit={handleReset}>
        <Input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-3"
        />
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4"
        />
        <Button disabled={loading} type="submit" className="w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}
