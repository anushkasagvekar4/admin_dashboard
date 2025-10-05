"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { signinUser } from "@/app/features/auth/authApi"; // 👈 make sure you have this
import { checkUserEnquiryStatus } from "@/app/features/shop_admin/enquiry/enquirySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Helper function to handle shop admin redirect based on enquiry status
  const handleShopAdminRedirect = async () => {
    try {
      const enquiryStatusResult = await dispatch(checkUserEnquiryStatus()).unwrap();
      
      if (!enquiryStatusResult.hasEnquiry) {
        // No enquiry submitted, redirect to enquiry form
        router.push("/auth/enquiry");
      } else if (enquiryStatusResult.status === "pending") {
        // Enquiry pending, redirect to status page
        router.push("/admin/enquiry-status");
      } else if (enquiryStatusResult.status === "approved") {
        // Enquiry approved, check if this is first login after approval
        // For now, redirect to welcome page to show the success message
        router.push("/admin/welcome");
      } else if (enquiryStatusResult.status === "rejected") {
        // Enquiry rejected, redirect to enquiry form to resubmit
        router.push("/auth/enquiry");
      }
    } catch (error) {
      console.error("Failed to check enquiry status:", error);
      // Fallback to enquiry form if status check fails
      router.push("/auth/enquiry");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(signinUser({ email, password }))
      .unwrap()
      .then(async (res) => {
        toast.success("Signed in successfully!", {
          description: `Welcome back, ${res.email}!`,
        });

        // ✅ Role-based redirect
        if (res.role === "super_admin") {
          router.push("/super_admin/home");
        } else if (res.role === "shop_admin") {
          // Check enquiry status for shop admin
          await handleShopAdminRedirect();
        } else if (res.role === "customer") {
          router.push("/customer/home");
        } else {
          toast.error("Unknown role");
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
          </div>

          <Button disabled={loading} className="w-full h-11 rounded-xl">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

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
