// app/features/cart/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCartAPI,
  updateCartItemAPI,
  removeFromCartAPI,
  CartItem as APICartItem,
} from "./cartApi";

interface CartItem {
  id: string;
  cake_name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local actions for immediate UI updates
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.map((item: APICartItem) => ({
        id: item.id,
        cake_name: item.cake?.cake_name || "",
        price: item.price,
        image: item.cake?.image || "",
        quantity: item.quantity,
      }));
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add to cart
    builder.addCase(addToCartAPI.fulfilled, (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);
      if (!existing) {
        state.items.push({
          id: item.id,
          cake_name: item.cake?.cake_name || "",
          price: item.price,
          image: item.cake?.image || "",
          quantity: item.quantity,
        });
      }
    });

    // Update cart item
    builder.addCase(updateCartItemAPI.fulfilled, (state, action) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    });

    // Remove from cart
    builder.addCase(removeFromCartAPI.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
