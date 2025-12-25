import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

export interface DeliveryInstructions {
  orderId: string;
  instructions: string;
  preferredTime?: string;
  specialHandling?: string;
  contactPreference?: 'phone' | 'email' | 'text';
}

export const saveDeliveryInstructions = createAsyncThunk(
  "orders/saveDeliveryInstructions",
  async (instructions: DeliveryInstructions, thunkAPI) => {
    try {
      const res = await api.post(`/orders/delivery-instructions`, instructions);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error saving delivery instructions"
      );
    }
  }
);

export const getDeliveryInstructions = createAsyncThunk(
  "orders/getDeliveryInstructions",
  async (orderId: string, thunkAPI) => {
    try {
      const res = await api.get(`/orders/delivery-instructions/${orderId}`);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error fetching delivery instructions"
      );
    }
  }
);

export const updateDeliveryInstructions = createAsyncThunk(
  "orders/updateDeliveryInstructions",
  async ({ orderId, instructions }: { orderId: string; instructions: Partial<DeliveryInstructions> }, thunkAPI) => {
    try {
      const res = await api.put(`/orders/delivery-instructions/${orderId}`, instructions);
      return res.data.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data || "Error updating delivery instructions"
      );
    }
  }
);
