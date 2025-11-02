"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { signinUser } from "@/app/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkUserEnquiryStatusAPI } from "@/app/features/shop_admin/enquiry/enquiryApi";

export default function Signin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * 🟢 Handle redirect for shop admin after signin
   */
  const handleShopAdminRedirect = async () => {
    try {
      const res = await checkUserEnquiryStatusAPI();

      // ✅ Match backend structure exactly
      const data = res.data; // { hasEnquiry, status, enquiry }

      if (!data?.hasEnquiry) {
        router.push("/auth/enquiry");
        return;
      }

      switch (data.status) {
        case "pending":
          router.push("/auth/enquiry/enquiry-status");
          break;
        case "approved":
          router.push("/admin/home");
          break;
        case "rejected":
          router.push("/auth/enquiry/enquiry-status");
          break;
        default:
          router.push("/auth/enquiry");
      }
    } catch (err) {
      console.error("❌ Failed to check enquiry status:", err);
      toast.error("Could not verify enquiry status. Redirecting...");
      // router.push("/auth/enquiry");
    }
  };

  /**
   * 🟢 Handle signin submit
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(signinUser({ email, password }))
      .unwrap()
      .then(async (res) => {
        toast.success("Signed in successfully!", {
          description: `Welcome back, ${res.email}!`,
        });

        // ✅ Role-based redirect
        switch (res.role) {
          case "super_admin":
            router.push("/super_admin/home");
            break;
          case "shop_admin":
            await handleShopAdminRedirect();
            break;
          case "customer":
            router.push("/customer/home");
            break;
          default:
            toast.error("Unknown user role");
        }
      })
      .catch((err) => {
        toast.error("Signin failed", {
          description: err || "Invalid credentials",
        });
      });
  };

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">Sign in to your account</h1>
          <p className="text-muted-foreground">
            Access your personalized CakeHaven dashboard
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9 h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10 h-11 rounded-xl"
              />
            </div>
            <Link href="/auth/forgot-password">Forgot Password</Link>
          </div>

          {/* Submit Button */}
          <Button disabled={loading} className="w-full h-11 rounded-xl">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Error */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Sign Up link */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
