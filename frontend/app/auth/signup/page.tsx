"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store/hook";
import { signupUser } from "@/app/features/auth/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [role, setRole] = useState<"shop_admin" | "customer">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch(signupUser({ email, password, role }))
      .unwrap()
      .then((res) => {
        toast.success("Account created!", {
          description: `Welcome, ${res.email}!`,
        });

        // ✅ Role-based redirect
        if (res.role === "super_admin") {
          router.push("/super_admin/home");
        } else if (res.role === "shop_admin") {
          router.push("/admin/home");
        } else {
          router.push("/customer/home");
        }
      })
      .catch((err) => {
        toast.error("Signup failed", {
          description: err || "Something went wrong",
        });
      });
  };

  return (
    <div className="container mx-auto py-12 md:py-16">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-muted-foreground">
            Join CakeHaven to discover and order delightful cakes
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            type="button"
            variant={role === "customer" ? "default" : "outline"}
            onClick={() => setRole("customer")}
          >
            Customer
          </Button>
          <Button
            type="button"
            variant={role === "shop_admin" ? "default" : "outline"}
            onClick={() => setRole("shop_admin")}
          >
            Shop Admin
          </Button>
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
            {loading
              ? "Creating..."
              : `Create ${
                  role === "customer" ? "Customer" : "Shop Admin"
                } Account`}
          </Button>
        </form>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
