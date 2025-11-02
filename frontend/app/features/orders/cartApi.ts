import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

export interface CartItem {
  id: string;
  userId: string;
  cakeId: string;
  cake_name?: string;
  image?: string;
  quantity: number;
  price: number;
  created_at?: string;
  updated_at?: string;
  cake?: {
    id: string;
    cake_name: string;
    image: string;
    price: number;
  };
}

// Fetch cart items
export const fetchCart = createAsyncThunk<
  CartItem[],
  void,
  { rejectValue: string }
>("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/cart/getCart");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch cart"
    );
  }
});

// Add item to cart
export const addToCartAPI = createAsyncThunk<
  CartItem,
  { cakeId: string; quantity: number; price: number },
  { rejectValue: string }
>("cart/addToCart", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/cart/addToCart", payload);
    // ✅ Return the actual cart item, not the wrapper object
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to add to cart"
    );
  }
});

// Update cart item quantity
export const updateCartItemAPI = createAsyncThunk<
  CartItem,
  { id: string; quantity: number },
  { rejectValue: string }
>("cart/updateCartItem", async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/cart/updateCartItem/${id}`, {
      quantity,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update cart item"
    );
  }
});

// Remove item from cart
export const removeFromCartAPI = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("cart/removeFromCart", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/cart/removeCartItem/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to remove from cart"
    );
  }
});
