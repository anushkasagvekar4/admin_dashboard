import { SectionHeading } from "@/app/Home/SectionHeading";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Sales",
      value: "$124,560",
      sub: "+12% vs last week",
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: "8,942",
      sub: "+4% vs last week",
      icon: ShoppingCart,
    },
    {
      label: "Active Shops",
      value: "128",
      sub: "-2 closed this week",
      icon: Store,
    },
    { label: "Customers", value: "23,417", sub: "+356 new", icon: Users },
  ];

  const topShops = [
    { name: "Sweet Bloom", sales: "$32,100" },
    { name: "Velvet Bakehouse", sales: "$28,780" },
    { name: "Sugar Studio", sales: "$25,940" },
  ];

  const topCakes = [
    { name: "Red Velvet Delight", orders: 1420 },
    { name: "Classic Chocolate", orders: 1285 },
    { name: "Blueberry Cheesecake", orders: 980 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Platform Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          System-wide metrics across all shops
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </div>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <s.icon />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <ArrowUpRight size={14} /> {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <SectionHeading
            title="Top-Selling Shops"
            subtitle="By total sales"
            className="mb-4 text-left"
          />
          <ul className="space-y-3">
            {topShops.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.sales}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border p-5">
          <SectionHeading
            title="Top-Selling Cakes"
            subtitle="By orders"
            className="mb-4 text-left"
          />
          <ul className="space-y-3">
            {topCakes.map((c) => (
              <li key={c.name} className="flex items-center justify-between">
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">
                  {c.orders.toLocaleString()} orders
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
