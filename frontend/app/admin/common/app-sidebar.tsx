import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { HiMiniUsers } from "react-icons/hi2";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BsFillCake2Fill } from "react-icons/bs";

import { FaBoxesPacking } from "react-icons/fa6";
import { BiSolidAddToQueue } from "react-icons/bi";
import { IoBarChartSharp } from "react-icons/io5";
import Image from "next/image";

const items = [
  // {
  //   title: "Home",
  //   url: "/admin/dashboard",
  //   icon: IoBarChartSharp,
  // },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: HiMiniUsers,
  },
  // {
  //   title: "Cakes",
  //   url: "/admin/cake_list",
  //   icon: BsFillCake2Fill,
  // },
  // {
  //   title: "Orders",
  //   url: "/admin/orders",
  //   icon: FaBoxesPacking,
  // },
  {
    title: "User Form",
    url: "/admin/add_user",
    icon: BiSolidAddToQueue,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-5 mt-5">
            <Image
              src={"/icons/cakeadminlogo.png"}
              alt="cakeAdmin logo"
              height={80}
              width={80}
            ></Image>
            <h1 className="text-2xl font-semibold text-orange-950">
              CakeAdmin
            </h1>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
