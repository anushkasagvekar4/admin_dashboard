import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// Backend Customer interface
export interface BackendCustomer {
  id: string;
  full_name: string;
  email: string;
  address: string;
  phone: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
}

// Data sent from frontend
export interface CustomerData {
  full_name: string;
  email: string;
  address: string;
  phone: string;
}

/* =========================================================
   🧩 CUSTOMER CRUD for Logged-in Customer
========================================================= */

// ✅ CREATE Customer (for first-time profile setup)
export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (data: CustomerData, { rejectWithValue }) => {
    try {
      const res = await api.post("/customers/createCustomer", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create customer"
      );
    }
  }
);

// ✅ GET Current Logged-in Customer
export const getMyCustomer = createAsyncThunk<
  BackendCustomer,
  void,
  { rejectValue: string }
>("customers/getMyCustomer", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/customers/getMyCustomer/me");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch my profile"
    );
  }
});

// ✅ UPDATE Current Logged-in Customer
export const updateMyCustomer = createAsyncThunk<
  BackendCustomer,
  Partial<CustomerData>,
  { rejectValue: string }
>("customers/updateMyCustomer", async (data, { rejectWithValue }) => {
  try {
    const res = await api.patch("/customers/updateMyCustomer/me", data);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update my profile"
    );
  }
});

/* =========================================================
   🧩 ADMIN / SUPER ADMIN Operations
========================================================= */

// ✅ GET ALL Customers (for admin/super admin)
export const getAllCustomers = createAsyncThunk<
  BackendCustomer[],
  void,
  { rejectValue: string }
>("customers/getAllCustomers", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/customers/getAllCustomers");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch customers"
    );
  }
});

// ✅ GET Customer by ID (for admin/super admin view)
export const getCustomerById = createAsyncThunk(
  "customers/getCustomerById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/customers/getCustomerById/${id}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch customer"
      );
    }
  }
);

// ✅ UPDATE any Customer (admin-level)
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (
    { id, data }: { id: string; data: Partial<CustomerData> },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/customers/updateCustomer/${id}`, data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer"
      );
    }
  }
);

// ✅ TOGGLE Customer Status (admin-level)
export const updateCustomerStatus = createAsyncThunk(
  "customers/updateCustomerStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(
        `/customers/updateCustomerStatus/${id}/status`,
        { status }
      );
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status"
      );
    }
  }
);
