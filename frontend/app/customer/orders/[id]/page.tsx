"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { SectionHeading } from "@/app/Home/SectionHeading";
import { Truck, CheckCircle2, Clock } from "lucide-react";
import { fetchOrderById, fetchAllOrders } from "@/app/features/orders/orderApi";

export default function CustomerTracker() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, orders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  const steps = ["Placed", "Baking", "Dispatched", "Delivered"];

  // Map order status to step number for tracking
  const getStep = (status: string) => {
    switch (status) {
      case "Pending":
        return 2;
      case "Completed":
        return 4;
      case "Cancelled":
        return 0;
      default:
        return 1;
    }
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchOrderById(id));
    }
    // Also fetch all orders for the recent orders table
    dispatch(fetchAllOrders());
  }, [dispatch, id]);

  if (loading || !currentOrder) return <p>Loading order tracking...</p>;

  const currentStep = getStep(currentOrder.status);
  const itemsList = currentOrder.items
    ?.map((i) => i.cake?.cake_name)
    .filter(Boolean)
    .join(", ") || "No items";

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

      {/* Tracking Steps */}
      <div className="rounded-xl border p-5">
        <SectionHeading
          title={`Order #${currentOrder.order_no}`}
          subtitle={`${itemsList} · ${currentOrder.status}`}
          className="mb-4 text-left"
        />
        <div className="flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`size-9 rounded-full flex items-center justify-center ${
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1 < currentStep ? (
                  <CheckCircle2 size={18} />
                ) : i + 1 === currentStep ? (
                  <Truck size={18} />
                ) : (
                  <Clock size={18} />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-10 h-1 mx-2 rounded ${
                    i + 1 < currentStep ? "bg-primary/60" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
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
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-medium">#{o.order_no}</td>
                  <td className="p-3">
                    {o.items?.map((i) => i.cake?.cake_name).join(", ") || "N/A"}
                  </td>
                  <td className="p-3">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
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
