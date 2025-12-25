import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

export const reorderItems = createAsyncThunk(
  "orders/reorderItems",
  async (orderItems: Array<{ cake_id: string; qty: number }>, thunkAPI) => {
    try {
      const res = await api.post("/orders/reorder", { items: orderItems });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error reordering items"
      );
    }
  }
);

export const addToCartFromOrder = createAsyncThunk(
  "orders/addToCartFromOrder",
  async (orderItems: Array<{ cake_id: string; qty: number }>, thunkAPI) => {
    try {
      const res = await api.post("/cart/addFromOrder", { items: orderItems });
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error adding items to cart"
      );
    }
  }
);

export const getReorderSuggestions = createAsyncThunk(
  "orders/getReorderSuggestions",
  async (customerId: string, thunkAPI) => {
    try {
      const res = await api.get(`/orders/reorder-suggestions/${customerId}`);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching reorder suggestions"
      );
    }
  }
);
