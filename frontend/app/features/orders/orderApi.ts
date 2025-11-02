import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

export interface OrderItem {
  id: string;
  cake_id: string;
  qty: number;
  price: number;
  cake?: {
    id: string;
    cake_name: string;
    image: string;
  };
}

export interface Order {
  id: string;
  order_no: number;
  customer_id: string;
  status: "Pending" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  items?: OrderItem[];
}

// Fetch all orders (for admin)
export const fetchAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetchAllOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/orders/getAllOrders");
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// Fetch single order by ID
export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/getCakeById/${id}`);
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch order"
    );
  }
});

// Create new order
export const createOrder = createAsyncThunk<
  Order,
  {
    order_no: number;
    customer_id: string;
    status: "Pending" | "Completed" | "Cancelled";
    items: { cake_id: string; qty: number; price: number }[];
  },
  { rejectValue: string }
>("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post("/orders/createOrder", orderData);
    return response.data.data || response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create order"
    );
  }
});

// Delete order
export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("orders/deleteOrder", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/orders/deleteOrder/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete order"
    );
  }
});
