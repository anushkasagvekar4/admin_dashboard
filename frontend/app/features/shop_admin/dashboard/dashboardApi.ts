import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/utils/axios";

// Dashboard Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCakes: number;
  activeCakes: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface RecentOrder {
  id: string;
  orderNo: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt: string;
  items: {
    cake_name: string;
    qty: number;
    price: number;
  }[];
}

export interface TopSellingCake {
  id: string;
  cake_name: string;
  price: number;
  totalOrders: number;
  totalRevenue: number;
  image?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topSellingCakes: TopSellingCake[];
  revenueChart: RevenueData[];
}

// Get Dashboard Analytics
export const getDashboardAnalytics = createAsyncThunk<
  DashboardData,
  void,
  { rejectValue: string }
>("dashboard/getAnalytics", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/shopadmin/dashboard/analytics");
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch dashboard analytics"
    );
  }
});

// Get Recent Orders
export const getRecentOrders = createAsyncThunk<
  RecentOrder[],
  { limit?: number },
  { rejectValue: string }
>("dashboard/getRecentOrders", async ({ limit = 10 }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shopadmin/dashboard/recent-orders?limit=${limit}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch recent orders"
    );
  }
});

// Get Top Selling Cakes
export const getTopSellingCakes = createAsyncThunk<
  TopSellingCake[],
  { limit?: number },
  { rejectValue: string }
>("dashboard/getTopSellingCakes", async ({ limit = 5 }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shopadmin/dashboard/top-cakes?limit=${limit}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch top selling cakes"
    );
  }
});

// Get Revenue Chart Data
export const getRevenueChartData = createAsyncThunk<
  RevenueData[],
  { period?: 'week' | 'month' | 'year' },
  { rejectValue: string }
>("dashboard/getRevenueChart", async ({ period = 'week' }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/shopadmin/dashboard/revenue-chart?period=${period}`);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch revenue chart data"
    );
  }
});
