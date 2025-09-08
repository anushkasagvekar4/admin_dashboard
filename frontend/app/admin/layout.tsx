"use client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./common/app-sidebar";
import { ReactNode } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { logoutUser } from "../features/auth/authApi";
export default function Layout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logoutUser());
        router.push("/");
      }
    });
  };
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Section */}
      <SidebarInset className="flex flex-col w-full">
        {/* Top Navbar */}
        <header className="flex h-14 shrink-0 bg-orange-100 items-center gap-2 border-b px-4">
          <SidebarTrigger className="text-orange-950 hover:text-orange-950 " />
          <h1 className="text-lg font-semibold  text-orange-950">
            Admin Panel
          </h1>
          <Button
            className="p-2 ml-auto bg-orange-950 text-white  hover:bg-orange-900"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </header>

        {/* Page Content (full width, full height) */}
        <main className="flex-1 p-6 w-full h-full overflow-y-auto bg-white">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
