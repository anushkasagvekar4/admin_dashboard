"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchCart, updateCartItemAPI, removeFromCartAPI } from "@/app/features/orders/cartApi";
import { updateQuantity, clearCart } from "@/app/features/orders/cartSlice";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function CustomerCart() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 2.5;
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(id);
    try {
      await dispatch(updateCartItemAPI({ id, quantity })).unwrap();
      dispatch(updateQuantity({ id, quantity }));
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setIsUpdating(id);
    try {
      await dispatch(removeFromCartAPI(id)).unwrap();
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCheckout = () => {
    router.push("/customer/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto animate-pulse text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => dispatch(fetchCart())}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">
            {items.length === 0 ? "Your cart is empty" : `You have ${items.length} item${items.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any cakes to your cart yet.</p>
              <Button onClick={() => router.push("/")} className="px-6">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-[1fr,360px] gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.cake_name}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.png";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{item.cake_name}</h3>
                        <p className="text-gray-600">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating === item.id || item.quantity <= 1}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating === item.id}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating === item.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6 h-12"
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    className="w-full mt-3"
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
