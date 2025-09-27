// features/super_admin/super_admin_shops/shopsApi.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// ---------- Types ----------
export interface Shop {
  id: string;
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: "active" | "inactive";
  createdAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchShopsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FetchShopsResponse {
  data: Shop[];
  pagination: Pagination;
}

// ---------- Async Thunks ----------

// Get all shops (with pagination)
export const fetchShops = createAsyncThunk<
  FetchShopsResponse,
  FetchShopsParams,
  { rejectValue: string }
>("shops/fetchShops", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/shops/getShops", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search ?? "",
        sortBy: params.sortBy ?? "created_at",
        sortOrder: params.sortOrder ?? "desc",
      },
    });
    return response.data as FetchShopsResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Get single shop by ID
export const fetchShopById = createAsyncThunk<
  { data: Shop },
  string,
  { rejectValue: string }
>("shops/fetchShopById", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shops/getShopById/${id}`);
    return res.data as { data: Shop };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch shop"
    );
  }
});

// Toggle shop status
export const toggleShopStatus = createAsyncThunk<
  Shop,
  string,
  { rejectValue: string }
>("shops/toggleShopStatus", async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/shops/toggleShopStatus/${id}`);
    console.log("🔄 toggleShopStatus response:", res.data);

    return res.data.data as Shop; // 👈 pick `data`
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update shop"
    );
  }
});
