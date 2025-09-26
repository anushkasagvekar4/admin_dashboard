"use client";
import { useState } from "react";
import { SectionHeading } from "@/app/Home/SectionHeading";
import { Truck, CheckCircle2, Clock } from "lucide-react";

const orders = [
  {
    id: "#1024",
    item: "Red Velvet Delight",
    date: "Today",
    status: "Out for delivery",
    step: 3,
  },
  {
    id: "#1023",
    item: "Vanilla Dream",
    date: "Yesterday",
    status: "Delivered",
    step: 4,
  },
];

export default function CustomerTracker() {
  const [current] = useState(orders[0]);
  const steps = ["Placed", "Baking", "Dispatched", "Delivered"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Order Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Follow your cake from oven to doorstep
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <SectionHeading
          title={`Tracking ${current.id}`}
          subtitle={`${current.item} · ${current.status}`}
          className="mb-4 text-left"
        />
        <div className="flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`size-9 rounded-full flex items-center justify-center ${
                  i + 1 <= current.step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1 < current.step ? (
                  <CheckCircle2 size={18} />
                ) : i + 1 === current.step ? (
                  <Truck size={18} />
                ) : (
                  <Clock size={18} />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-10 h-1 mx-2 rounded ${
                    i + 1 < current.step ? "bg-primary/60" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionHeading title="Recent Orders" className="mb-2 text-left" />
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-medium">{o.id}</td>
                  <td className="p-3">{o.item}</td>
                  <td className="p-3">{o.date}</td>
                  <td className="p-3">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
