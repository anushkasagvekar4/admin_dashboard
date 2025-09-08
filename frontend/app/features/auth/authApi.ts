import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

interface SignInPayload {
  email: string;
  password: string;
}

export const signinUser = createAsyncThunk(
  "auth/signin",
  async (payload: SignInPayload, { rejectWithValue }) => {
    try {
      // ✅ Cookie will be set automatically by backend
      const response = await api.post("/auth/signin", payload);
      return response.data; // { success, message, isAdmin, token }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Signin failed" }
      );
    }
  }
);
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (args, { rejectWithValue }) => {
    try {
      // ✅ Cookie will be set automatically by backend
      const response = await api.post("/auth/logout");
      return response.data; // { success, message, isAdmin, token }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Signin failed" }
      );
    }
  }
);
