import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// features/shop_admin/cakes/cakeApi.ts

interface BackendCake {
  id: number;
  image: string;
  cake_name: string;
  price: number;
  cake_type: string;
  flavour: string;
  category: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CakeData {
  image: string;
  cake_name: string;
  price: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: number;
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

// Example thunk
export const getCakes = createAsyncThunk<
  BackendCake[],
  void,
  { rejectValue: string }
>("cakes/getCakes", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/cakes/getAllCakes");
    console.log("Raw backend data:", res.data.data);
    return res.data.data; // backend array
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Fetching cakes failed"
    );
  }
});

// GET BY ID
export const getCakeById = createAsyncThunk(
  "cakes/getCakeById",
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cakes/getCakeById/${id}`);
      return res.data; // { success, data }
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
      const res = await api.patch(`/cakes/updateCake/${id}`, data);
      return res.data; // { success, data, message }
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
      return res.data; // { success, message }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Delete cake failed. Try again."
      );
    }
  }
);
