import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// features/shop_admin/cakes/cakeApi.ts

interface BackendCake {
  id: string; // changed from number to string (UUID)
  image: string;
  cake_name: string;
  price: number;
  cake_type?: string;
  flavour?: string;
  category?: string;
  size?: string;
  noofpeople?: number;
  status: "active" | "inactive"; // active/inactive
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
      return res.data; // { success, message, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Create cake failed. Try again."
      );
    }
  }
);

// GET ALL
export const getCakes = createAsyncThunk<
  BackendCake[],
  void,
  { rejectValue: string }
>("cakes/getCakes", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/cakes/getAllCakes");
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
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cakes/getCakeById/${id}`);
      return res.data.data; // only return the cake object
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
      return res.data.data; // updated cake
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Update cake failed. Try again."
      );
    }
  }
);

// TOGGLE STATUS (instead of hard delete)
export const toggleCakeStatus = createAsyncThunk(
  "cakes/toggleCakeStatus",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/cakes/toggleCakeStatus/${id}`);
      return res.data.data; // returns cake with updated status
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Toggle cake status failed. Try again."
      );
    }
  }
);

// Example small improvement for DELETE to return the deleted id directly
export const deleteCake = createAsyncThunk<string, string>(
  "cakes/deleteCake",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/cakes/deleteCake/${id}`);
      return id; // return id directly
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Delete cake failed. Try again."
      );
    }
  }
);
