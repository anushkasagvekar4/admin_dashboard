import { createSlice } from "@reduxjs/toolkit";
import { fetchAllOrders, fetchOrderById, createOrder, deleteOrder } from "./orderApi";

interface OrderItem {
  id: string;
  cake_id: string;
  qty: number;
  price: number;
  cake?: {
    id: string;
    cake_name: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  orderNo: number;
  customerId: string;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
  items?: OrderItem[];
}

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

    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete order
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
