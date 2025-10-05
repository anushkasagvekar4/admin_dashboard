import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// Backend Customer interface
interface BackendCustomer {
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

// 🧩 CREATE Customer (for logged-in customer)
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

// 🧩 GET ALL Customers
export const getAllCustomers = createAsyncThunk<
  BackendCustomer[],
  void,
  { rejectValue: string }
>("customers/getAllCustomers", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/customers/getAllCustomer");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch customers"
    );
  }
});

// 🧩 GET Customer by ID
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

// 🧩 UPDATE Customer Profile (only by that customer)
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

// 🧩 TOGGLE Customer Status (only by shop admin)
export const updateCustomerStatus = createAsyncThunk(
  "customers/updateCustomerStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/customers/updateCustomerStatus/${id}`, {
        status,
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// ❌ DELETE (not implemented in backend)
export const deleteCustomer = createAsyncThunk<string, string>(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      // No backend route available for deletion
      return rejectWithValue("Delete customer API not implemented");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Delete customer failed"
      );
    }
  }
);
