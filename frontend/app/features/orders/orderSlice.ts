import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAllOrders,
  fetchOrderById,
  createOrder,
  deleteOrder,
  Order,
} from "./orderApi";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all orders
    builder.addCase(fetchAllOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchAllOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch order by ID
    builder.addCase(fetchOrderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrder = action.payload;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create order
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.orders.unshift(action.payload);
    });

    // Delete order
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
