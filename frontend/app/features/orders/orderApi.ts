import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

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

export const fetchOrderById = createAsyncThunk(
  "orders/fetchById",
  async (id: string, thunkAPI) => {
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
