import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// Backend Shop Admin interface
export interface BackendShopAdmin {
  id: string;
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  logo?: string;
  status: "active" | "inactive";
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Data sent from frontend for creation
export interface ShopAdminData {
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  logo?: string;
}

// Data sent from frontend (without email - for updates)
export interface ShopAdminUpdateData {
  shopname: string;
  ownername: string;
  phone: string;
  address: string;
  city: string;
  logo?: string;
}

/* =========================================================
   🧩 SHOP ADMIN CRUD for Logged-in Shop Admin
========================================================= */

// ✅ CREATE Shop Admin (for first-time profile setup)
export const createShopAdmin = createAsyncThunk(
  "shopAdmin/createShopAdmin",
  async (data: ShopAdminData, { rejectWithValue }) => {
    try {
      const res = await api.post("/shops/createShop", data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create shop profile"
      );
    }
  }
);

// ✅ GET Current Logged-in Shop Admin
export const getMyShopAdmin = createAsyncThunk<
  BackendShopAdmin,
  void,
  { rejectValue: string }
>("shopAdmin/getMyShopAdmin", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/shops/getMyShop");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch my shop profile"
    );
  }
});

// ✅ UPDATE Current Logged-in Shop Admin
export const updateMyShopAdmin = createAsyncThunk<
  BackendShopAdmin,
  ShopAdminUpdateData,
  { rejectValue: string }
>("shopAdmin/updateMyShopAdmin", async (data, { rejectWithValue }) => {
  try {
    const res = await api.patch("/shops/updateMyShop", data);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update my shop profile"
    );
  }
});

// ✅ Upload Shop Logo
export const uploadShopLogo = createAsyncThunk<
  string,
  File,
  { rejectValue: string }
>("shopAdmin/uploadShopLogo", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    const res = await api.post("/shops/uploadLogo", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.logoUrl;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to upload logo"
    );
  }
});
