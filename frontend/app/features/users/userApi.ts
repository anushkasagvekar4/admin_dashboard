import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios"; // your axios instance

// 1️⃣ Add User Async Thunk
export const addUser = createAsyncThunk(
  "users/add",
  async (
    payload: {
      full_name: string;
      email: string;
      address: string;
      phone: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // POST request to /api/users
      const response = await api.post("/users/createUser", payload);
      console.log(response);
      // response.data contains { success, message, data }
      return response.data;
    } catch (error: any) {
      // If backend sends an error, reject with its message
      return rejectWithValue(
        error.response?.data || { message: "Add user failed" }
      );
    }
  }
);

// 2️⃣ View Users (with pagination, search, sort)

// 2️⃣ Fetch Users (with pagination, search, sort)
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: "asc" | "desc";
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "created_at",
        order = "desc",
      } = params;

      const response = await api.get("/users/getAllUser", {
        params: { page, limit, search, sortBy, order },
      });
      console.log(response);
      // response.data should have: { succes, message, data, pagination }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/users/updateUserStatus/${id}`, {
        status,
      });
      // backend returns { success, message }
      return { id, status, ...response.data }; // include updated status + id
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || { message: "Update user status failed" }
      );
    }
  }
);
