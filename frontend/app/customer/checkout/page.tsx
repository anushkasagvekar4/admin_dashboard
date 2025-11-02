"use client";
import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/app/store/Store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, CreditCard, Package } from "lucide-react";

import { clearCart } from "@/app/features/orders/cartSlice";
import { createOrder } from "@/app/features/orders/orderApi";
import { fetchCart } from "@/app/features/orders/cartApi";

const checkoutSchema = z.object({
  address: z.string().min(10, "Address must be at least 10 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setValue("address", user.address || "");
      setValue("phone", user.phone || "");
    }
  }, [user, setValue]);

  // Calculate totals
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push("/customer/home");
      toast.error("Your cart is empty");
    }
  }, [items, loading, router]);

  const onSubmit = async (data: CheckoutForm) => {
    if (!user || !user.id) {
      toast.error("Please log in before placing an order.");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        order_no: Math.floor(Math.random() * 100000),
        customer_id: user.id,
        status: "Pending" as const,
        items: items.map((item) => ({
          cake_id: item.id,
          qty: item.quantity,
          price: item.price,
        })),
      };

      console.log("Final Payload:", JSON.stringify(orderData, null, 2));

      await dispatch(createOrder(orderData)).unwrap();

      dispatch(clearCart());
      toast.success("Order placed successfully!");
      router.push("/customer/orders");
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6"
      >
        <ArrowLeft size={18} /> Back to Cart
      </button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Delivery Information</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Input
                  {...register("address")}
                  id="address"
                  placeholder="Enter your full delivery address"
                  className="mt-1"
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  {...register("phone")}
                  id="phone"
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Input
                  {...register("notes")}
                  id="notes"
                  placeholder="Any special delivery instructions..."
                  className="mt-1"
                />
              </div>
            </form>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Payment Method</h2>
            </div>
            <p className="text-gray-600">Cash on Delivery (COD)</p>
            <p className="text-sm text-gray-500 mt-1">
              Pay when you receive your order
            </p>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.cake_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.cake_name}</h4>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit(onSubmit)}
              className="w-full mt-6 h-12"
              disabled={isPlacingOrder}
            >
              {isPlacingOrder
                ? "Placing Order..."
                : `Place Order - ₹${total.toFixed(2)}`}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By placing your order, you agree to our terms and conditions
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
