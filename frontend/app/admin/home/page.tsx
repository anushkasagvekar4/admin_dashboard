"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/app/components/dashboard/DashboardChart";
import {
  getDashboardAnalytics,
  getRecentOrders,
  getTopSellingCakes,
  getRevenueChartData,
  DashboardStats,
  RecentOrder,
  TopSellingCake,
  RevenueData,
} from "@/app/features/shop_admin/dashboard/dashboardApi";
import {
  getCakes,
} from "@/app/features/shop_admin/cakes/cakeApi";
import {
  DollarSign,
  ShoppingCart,
  Cake,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topCakes, setTopCakes] = useState<TopSellingCake[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [analyticsRes, ordersRes, cakesRes, revenueRes, allCakesRes] = await Promise.all([
          dispatch(getDashboardAnalytics()).unwrap().catch(() => null),
          dispatch(getRecentOrders({ limit: 5 })).unwrap().catch(() => []),
          dispatch(getTopSellingCakes({ limit: 5 })).unwrap().catch(() => []),
          dispatch(getRevenueChartData({ period: chartPeriod })).unwrap().catch(() => []),
          dispatch(getCakes()).unwrap().catch(() => []),
        ]);

        if (analyticsRes) {
          setStats(analyticsRes.stats);
          setRecentOrders(analyticsRes.recentOrders || []);
          setTopCakes(analyticsRes.topSellingCakes || []);
          setRevenueData(analyticsRes.revenueChart || []);
        } else {
          // Fallback: use individual API calls
          setRecentOrders(ordersRes);
          setTopCakes(cakesRes);
          setRevenueData(revenueRes);
          
          // Calculate basic stats from available data
          const calculatedStats: DashboardStats = {
            totalRevenue: 0,
            totalOrders: ordersRes?.length || 0,
            totalCakes: allCakesRes?.length || 0,
            activeCakes: allCakesRes?.filter(cake => cake.status === 'active').length || 0,
            pendingOrders: ordersRes?.filter(order => order.status === 'Pending').length || 0,
            completedOrders: ordersRes?.filter(order => order.status === 'Completed').length || 0,
            averageOrderValue: ordersRes?.length ? 
              ordersRes.reduce((sum, order) => sum + order.totalAmount, 0) / ordersRes.length : 0,
            revenueGrowth: 0,
            ordersGrowth: 0,
          };
          setStats(calculatedStats);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch, token, chartPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Shop Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your shop today.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link href="/admin/add_cakes">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Cake
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats?.revenueGrowth && stats.revenueGrowth > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{stats.revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600">{stats?.revenueGrowth || 0}%</span>
                </>
              )}
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats?.ordersGrowth && stats.ordersGrowth > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{stats.ordersGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600">{stats?.ordersGrowth || 0}%</span>
                </>
              )}
              <span className="ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cakes</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCakes || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.totalCakes || 0} total cakes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.averageOrderValue || 0)}</div>
            <div className="text-xs text-muted-foreground">
              Per order average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Your shop's revenue over time</CardDescription>
                </div>
                <div className="flex gap-1">
                  {(['week', 'month', 'year'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={chartPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartPeriod(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} type="revenue" period={chartPeriod} />
            </CardContent>
          </Card>
        </div>

        {/* Order Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Current order breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Pending</span>
              </div>
              <Badge variant="secondary">{stats?.pendingOrders || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Completed</span>
              </div>
              <Badge variant="secondary">{stats?.completedOrders || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">Cancelled</span>
              </div>
              <Badge variant="secondary">
                {(stats?.totalOrders || 0) - (stats?.completedOrders || 0) - (stats?.pendingOrders || 0)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Top Selling Cakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{order.orderNo}</span>
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {order.customerName} • {order.items?.length || 0} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(order.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Cakes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Selling Cakes</CardTitle>
              <CardDescription>Your most popular items</CardDescription>
            </div>
            <Link href="/admin/cakes">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCakes.length > 0 ? (
                topCakes.map((cake, index) => (
                  <div key={cake.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{cake.cake_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {cake.totalOrders} orders
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(cake.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(cake.price)} each
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Cake className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No sales data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
