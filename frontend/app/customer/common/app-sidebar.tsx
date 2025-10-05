"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ShoppingCart,
  CakeIcon,
  User,
  Cookie,
  Menu,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/store/Store";
import { logoutUser } from "@/app/features/auth/authApi";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // ✅ get logged-in user from Redux store
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // ✅ build nav dynamically *after* user is available
  const nav: NavItem[] = [
    { href: "/customer/home", label: "Home", icon: Home },
    { href: "/customer/cart", label: "Cart", icon: ShoppingCart },
    { href: "/customer/orders", label: "Order", icon: CakeIcon },
    {
      // Using only /customer/profile as the profile page will fetch user data
      href: "/customer/profile",
      label: "Profile",
      icon: User,
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/signin");
  };
  
  const LinkItem = ({ href, label, icon: Icon }: NavItem) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-secondary"
        )}
        onClick={() => setOpen(false)}
      >
        <Icon className="w-5 h-5" />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-card">
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="p-5 border-b flex items-center gap-2">
              <div className="size-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Cookie className="text-primary" />
              </div>
              <div className="text-xl font-extrabold">CakeHaven</div>
            </div>
            <nav className="p-3 space-y-2">
              {nav.map((i) => (
                <LinkItem key={i.href} {...i} />
              ))}
            </nav>
          </div>
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden p-2 border-b flex items-center justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-5 border-b flex items-center gap-2">
              <div className="size-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Cookie className="text-primary" />
              </div>
              <div className="text-xl font-extrabold">CakeHaven</div>
            </div>
            <nav className="p-3 space-y-2">
              {nav.map((i) => (
                <LinkItem key={i.href} {...i} />
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="text-lg font-semibold">Customer</div>
      </div>
    </>
  );
}
