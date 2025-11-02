"use client";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/app/store/Store";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/app/features/orders/cartSlice";
import {
  fetchCart,
  updateCartItemAPI,
  removeFromCartAPI,
} from "@/app/features/orders/cartApi";

export default function CustomerCart() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading } = useSelector((state: RootState) => state.cart);

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Update quantity
  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    try {
      await dispatch(updateCartItemAPI({ id, quantity: qty })).unwrap();
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  // Remove item
  const removeItem = async (id: string) => {
    try {
      await dispatch(removeFromCartAPI(id)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // Calculate subtotal
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Your cart is empty.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr,360px] gap-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border p-4 flex gap-4 items-center"
              >
                <img
                  src={item.image}
                  alt={item.cake_name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.cake_name}</div>
                  <div className="text-sm text-gray-500">
                    ₹{Number(item.price).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-md border text-lg font-semibold"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <div className="w-8 text-center">{item.quantity}</div>
                  <button
                    className="w-8 h-8 rounded-md border text-lg font-semibold"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="rounded-xl border p-5 h-fit">
            <div className="font-semibold">Order Summary</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹50.00</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total</span>
                <span>₹{(subtotal + 50).toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-4 h-11 rounded-xl"
              disabled={items.length === 0}
              onClick={() => router.push("/customer/checkout")}
            >
              Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2 h-11 rounded-xl text-red-600 border-red-400 hover:bg-red-50"
              onClick={() => dispatch(clearCart())}
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
