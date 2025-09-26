import api from "@/app/utils/axios";
// app/features/auth/authApi.ts
import { createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (
    {
      email,
      password,
      role,
    }: { email: string; password: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/signup", { email, password, role });
      return res.data; // { success, message, role, token, email }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Signup failed. Try again."
      );
    }
  }
);

// ✅ Signin
export const signinUser = createAsyncThunk(
  "auth/signinUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/signin", { email, password });
      return res.data; // { success, message, role, token, email }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Signin failed. Try again."
      );
    }
  }
);

// ✅ Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/logout");
      return res.data; // { success, message }
    } catch (err: any) {
      return rejectWithValue("Logout failed. Try again.");
    }
  }
);
