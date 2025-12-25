import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";
import { connectOrderTracking, disconnectOrderTracking, Tracking } from "./trackingService";

export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/orders/getAllOrders");
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching orders"
      );
    }
  }
);

export const fetchShopOrders = createAsyncThunk(
  "orders/fetchShopOrders",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/orders/getShopOrders");
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching shop orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: number | string, thunkAPI) => {
    try {
      const res = await api.get(`/orders/getOrderById/${id}`);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching order"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData: any, thunkAPI) => {
    try {
      const res = await api.post("/orders/createOrder", orderData);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error creating order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ id, tracking_status }: { id: string; tracking_status: string }, thunkAPI) => {
    try {
      const res = await api.put(`/orders/updateOrderStatus/${id}`, { tracking_status });
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error updating order status"
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/delete",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/orders/deleteOrder/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error deleting order"
      );
    }
  }
);

// Real-time tracking actions
export const startRealTimeTracking = createAsyncThunk(
  "orders/startRealTimeTracking",
  async (orderId: string, thunkAPI) => {
    try {
      const tracking = await api.get(`/orders/tracking/${orderId}`);
      return tracking.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching tracking details"
      );
    }
  }
);

export const subscribeToTrackingUpdates = (orderId: string, dispatch: any) => {
  return connectOrderTracking(orderId, (tracking: Tracking) => {
    dispatch({
      type: 'orders/updateTracking',
      payload: tracking
    });
  });
};

export const unsubscribeFromTrackingUpdates = () => {
  disconnectOrderTracking();
};
