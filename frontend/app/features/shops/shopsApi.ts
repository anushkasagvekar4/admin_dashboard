// features/shops/shopsApi.ts
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
  logo?: string;
  status: "active" | "inactive";
  created_at?: string;
}

export interface Cake {
  id: string;
  cake_name: string;
  description?: string;
  price: number;
  images?: string[];
  shopId: string;
  category?: string;
  available: boolean;
  created_at?: string;
}

export interface ShopWithCakes extends Shop {
  cakes: Cake[];
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
  city?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FetchShopsResponse {
  data: Shop[];
  pagination: Pagination;
}

// ---------- Async Thunks ----------

// Get all active shops (public)
export const fetchActiveShops = createAsyncThunk<
  FetchShopsResponse,
  FetchShopsParams,
  { rejectValue: string }
>("shops/fetchActiveShops", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/shops/public/getActiveShops", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 12,
        search: params.search ?? "",
        city: params.city ?? "",
        sortBy: params.sortBy ?? "created_at",
        sortOrder: params.sortOrder ?? "desc",
      },
    });
    return response.data as FetchShopsResponse;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Get single shop with cakes (public)
export const fetchShopWithCakes = createAsyncThunk<
  ShopWithCakes,
  string,
  { rejectValue: string }
>("shops/fetchShopWithCakes", async (shopId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shops/public/getShopWithCakes/${shopId}`);
    return res.data.data as ShopWithCakes;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch shop details"
    );
  }
});

// Get cakes by shop ID
export const fetchCakesByShop = createAsyncThunk<
  Cake[],
  string,
  { rejectValue: string }
>("shops/fetchCakesByShop", async (shopId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shops/public/getCakesByShop/${shopId}`);
    return res.data.data as Cake[];
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch shop cakes"
    );
  }
});
