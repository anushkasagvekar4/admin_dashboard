// features/shop_admin/cakes/cakeApi.ts
import api from "@/app/utils/axios";
import { createAsyncThunk } from "@reduxjs/toolkit";

export interface CakeData {
  image: string;
  cake_name: string;
  price: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: string;
  status?: "active" | "inactive";
}

// CREATE
export const createCake = createAsyncThunk(
  "cakes/createCake",
  async (data: CakeData, { rejectWithValue }) => {
    try {
      const res = await api.post("/cakes/createCake", data);
      return res.data; // expected: { success, message, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Create cake failed. Try again."
      );
    }
  }
);

// GET ALL
export const getCakes = createAsyncThunk(
  "cakes/getCakes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/cakes/getAllCake");
      console.log(res);
      return res.data; // expected: { success, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Fetching cakes failed. Try again."
      );
    }
  }
);

// GET BY ID
export const getCakeById = createAsyncThunk(
  "cakes/getCakeById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cakes/getCakeById/${id}`);
      return res.data; // expected: { success, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Fetching cake failed. Try again."
      );
    }
  }
);

// UPDATE
export const updateCake = createAsyncThunk(
  "cakes/updateCake",
  async (
    { id, data }: { id: string; data: Partial<CakeData> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(`/cakes/updateCake/${id}`, data);
      return res.data; // expected: { success, message, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Update cake failed. Try again."
      );
    }
  }
);

// DELETE
export const deleteCake = createAsyncThunk(
  "cakes/deleteCake",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cakes/deleteCake/${id}`);
      return res.data; // expected: { success, message }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Delete cake failed. Try again."
      );
    }
  }
);
