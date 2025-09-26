"use client";
import React, { useState } from "react";

interface CartItem {
  id: string;
  cake_name: string;
  image: string;
  price: number;
  quantity: number;
}

const initialCart: CartItem[] = [
  {
    id: "1",
    cake_name: "Chocolate Fudge",
    image: "https://via.placeholder.com/100",
    price: 1200,
    quantity: 2,
  },
  {
    id: "2",
    cake_name: "Vanilla Delight",
    image: "https://via.placeholder.com/100",
    price: 900,
    quantity: 1,
  },
];

const CustomerCart = () => {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  // Update quantity
  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  // Remove item
  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate total
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Image</th>
              <th className="border p-2">Cake</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">
                  <img
                    src={item.image}
                    alt={item.cake_name}
                    className="w-16 h-16 object-cover"
                  />
                </td>
                <td className="border p-2">{item.cake_name}</td>
                <td className="border p-2">{item.price}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-16 border rounded p-1"
                  />
                </td>
                <td className="border p-2">{item.price * item.quantity}</td>
                <td className="border p-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cart.length > 0 && (
        <div className="mt-4 text-right">
          <h2 className="text-xl font-bold">Total: ₹{total}</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-2">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;
