import { createSlice } from "@reduxjs/toolkit";
import { fetchAllOrders, fetchShopOrders, fetchOrderById, createOrder, updateOrderStatus, deleteOrder, startRealTimeTracking } from "./orderApi";
import { Tracking } from "./trackingService";

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
  id: number;
  orderNo: number;
  customerId: string;
  status: "Pending" | "Completed" | "Cancelled";
  trackingStatus?: "Order Placed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
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
  tracking: Tracking | null;
  loading: boolean;
  error: string | null;
  realTimeUpdates: boolean;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  tracking: null,
  loading: false,
  error: null,
  realTimeUpdates: false,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateTracking: (state, action) => {
      state.tracking = action.payload;
      if (state.currentOrder && state.currentOrder.id === action.payload.orderNo) {
        state.currentOrder.status = action.payload.status;
      }
    },
    toggleRealTimeUpdates: (state) => {
      state.realTimeUpdates = !state.realTimeUpdates;
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

    // Fetch shop orders
    builder.addCase(fetchShopOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchShopOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchShopOrders.rejected, (state, action) => {
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

    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete order
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    });

    // Start real-time tracking
    builder.addCase(startRealTimeTracking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(startRealTimeTracking.fulfilled, (state, action) => {
      state.loading = false;
      state.tracking = action.payload;
      state.realTimeUpdates = true;
    });
    builder.addCase(startRealTimeTracking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.realTimeUpdates = false;
    });
  },
});

export const { clearCurrentOrder, updateTracking, toggleRealTimeUpdates } = orderSlice.actions;
export default orderSlice.reducer;
