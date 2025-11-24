import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// Super Admin Dashboard Types
export interface SuperAdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeShops: number;
  inactiveShops: number;
  totalCustomers: number;
  totalCakes: number;
  pendingEnquiries: number;
  approvedEnquiries: number;
  rejectedEnquiries: number;
  revenueGrowth: number;
  ordersGrowth: number;
  shopsGrowth: number;
  customersGrowth: number;
}

export interface TopShop {
  id: string;
  shopname: string;
  ownername: string;
  email: string;
  city: string;
  totalRevenue: number;
  totalOrders: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface TopCake {
  id: string;
  cake_name: string;
  shopName: string;
  price: number;
  totalOrders: number;
  totalRevenue: number;
  image?: string;
}

export interface RecentEnquiry {
  id: string;
  shopname: string;
  ownername: string;
  email: string;
  phone: string;
  city: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  newShops: number;
  newCustomers: number;
}

export interface SuperAdminDashboardData {
  stats: SuperAdminDashboardStats;
  topShops: TopShop[];
  topCakes: TopCake[];
  recentEnquiries: RecentEnquiry[];
  revenueChart: RevenueData[];
}

// Get Super Admin Dashboard Analytics
export const getSuperAdminDashboardAnalytics = createAsyncThunk<
  SuperAdminDashboardData,
  void,
  { rejectValue: string }
>("superAdminDashboard/getAnalytics", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/super-admin/dashboard/analytics");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch dashboard analytics"
    );
  }
});

// Get Top Performing Shops
export const getTopPerformingShops = createAsyncThunk<
  TopShop[],
  { limit?: number; sortBy?: 'revenue' | 'orders' },
  { rejectValue: string }
>("superAdminDashboard/getTopShops", async ({ limit = 10, sortBy = 'revenue' }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/super-admin/dashboard/top-shops?limit=${limit}&sortBy=${sortBy}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch top shops"
    );
  }
});

// Get Top Selling Cakes
export const getTopSellingCakes = createAsyncThunk<
  TopCake[],
  { limit?: number },
  { rejectValue: string }
>("superAdminDashboard/getTopCakes", async ({ limit = 10 }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/super-admin/dashboard/top-cakes?limit=${limit}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch top cakes"
    );
  }
});

// Get Recent Enquiries
export const getRecentEnquiries = createAsyncThunk<
  RecentEnquiry[],
  { limit?: number; status?: 'pending' | 'approved' | 'rejected' },
  { rejectValue: string }
>("superAdminDashboard/getRecentEnquiries", async ({ limit = 10, status }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    
    const res = await api.get(`/super-admin/dashboard/recent-enquiries?${params}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch recent enquiries"
    );
  }
});

// Get System Revenue Chart Data
export const getSystemRevenueChartData = createAsyncThunk<
  RevenueData[],
  { period?: 'week' | 'month' | 'year' },
  { rejectValue: string }
>("superAdminDashboard/getRevenueChart", async ({ period = 'week' }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/super-admin/dashboard/revenue-chart?period=${period}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch revenue chart data"
    );
  }
});

// Quick Stats Update
export const updateQuickStats = createAsyncThunk<
  SuperAdminDashboardStats,
  void,
  { rejectValue: string }
>("superAdminDashboard/updateQuickStats", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/super-admin/dashboard/quick-stats");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update quick stats"
    );
  }
});
