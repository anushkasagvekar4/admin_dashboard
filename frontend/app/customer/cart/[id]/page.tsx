"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

interface Item {
  id: string;
  name: string;
  price: number;
  image: string;
}

const initialItems: Item[] = [
  {
    id: "c1",
    name: "Classic Chocolate",
    price: 18.99,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "c3",
    name: "Red Velvet Delight",
    price: 21.0,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?w=600&auto=format&fit=crop&q=60",
  },
];

export default function CustomerCart() {
  const [items, setItems] = useState(initialItems);
  const [qty, setQty] = useState<Record<string, number>>({ c1: 1, c3: 1 });

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * (qty[it.id] || 1), 0),
    [items, qty]
  );

  const updateQty = (id: string, v: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, v) }));
  const remove = (id: string) =>
    setItems((arr) => arr.filter((i) => i.id !== id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Your Cart
        </h1>
        <p className="text-muted-foreground mt-1">
          Review items and proceed to checkout
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-6">
        <div className="space-y-4">
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-xl border p-4 flex gap-4 items-center"
            >
              <img
                src={it.image}
                alt={it.name}
                className="size-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${it.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="size-8 rounded-md border"
                  onClick={() => updateQty(it.id, (qty[it.id] || 1) - 1)}
                >
                  -
                </button>
                <div className="w-8 text-center">{qty[it.id] || 1}</div>
                <button
                  className="size-8 rounded-md border"
                  onClick={() => updateQty(it.id, (qty[it.id] || 1) + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="text-sm text-destructive hover:underline"
                onClick={() => remove(it.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-xl border p-6 text-center text-muted-foreground">
              Your cart is empty.
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5 h-fit">
          <div className="font-semibold">Order Summary</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>$2.50</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>${(subtotal + 2.5).toFixed(2)}</span>
            </div>
          </div>
          <Button
            className="w-full mt-4 h-11 rounded-xl"
            disabled={items.length === 0}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
