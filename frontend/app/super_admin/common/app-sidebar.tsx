"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ShoppingCart,
  Truck,
  User,
  Cookie,
  Menu,
  LogOut,
  CakeIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaShop } from "react-icons/fa6";
import { useAppDispatch } from "@/app/store/hook";
import { logoutUser } from "@/app/features/auth/authApi";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/super_admin/home", label: "Home", icon: Home },
  { href: "/super_admin/enquiries", label: "Enquiries", icon: CakeIcon },
  { href: "/super_admin/shops", label: "Shops", icon: FaShop },
  // { href: "/customer/tracker", label: "Tracker", icon: Truck },
  // { href: "/super_admin/all_cakes", label: "Profile", icon: User },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        router.push("/auth/signin"); // redirect to signin
      });
  };

  const LinkItem = ({ href, label, icon: Icon }: any) => {
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
