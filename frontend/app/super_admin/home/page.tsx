"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuperAdminRevenueChart } from "@/app/components/dashboard/SuperAdminChart";
import {
  getSuperAdminDashboardAnalytics,
  getTopPerformingShops,
  getTopSellingCakes,
  getRecentEnquiries,
  getSystemRevenueChartData,
  SuperAdminDashboardStats,
  TopShop,
  TopCake,
  RecentEnquiry,
  RevenueData,
} from "@/app/features/super_admin/dashboard/dashboardApi";
import {
  fetchShops,
  toggleShopStatus,
} from "@/app/features/super_admin/super_admin_shops/shopsApi";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Users,
  Cake,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  AlertTriangle,
  FileText,
  BarChart3,
  Globe,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [topShops, setTopShops] = useState<TopShop[]>([]);
  const [topCakes, setTopCakes] = useState<TopCake[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartType, setChartType] = useState<'revenue' | 'orders' | 'shops' | 'customers' | 'combined'>('revenue');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [analyticsRes, shopsRes, cakesRes, enquiriesRes, revenueRes, allShopsRes] = await Promise.all([
          dispatch(getSuperAdminDashboardAnalytics()).unwrap().catch(() => null),
          dispatch(getTopPerformingShops({ limit: 5 })).unwrap().catch(() => []),
          dispatch(getTopSellingCakes({ limit: 5 })).unwrap().catch(() => []),
          dispatch(getRecentEnquiries({ limit: 5 })).unwrap().catch(() => []),
          dispatch(getSystemRevenueChartData({ period: chartPeriod })).unwrap().catch(() => []),
          dispatch(fetchShops({ limit: 10 })).unwrap().catch(() => null),
        ]);

        if (analyticsRes) {
          setStats(analyticsRes.stats);
          setTopShops(analyticsRes.topShops || []);
          setTopCakes(analyticsRes.topCakes || []);
          setRecentEnquiries(analyticsRes.recentEnquiries || []);
          setRevenueData(analyticsRes.revenueChart || []);
        } else {
          // Fallback: use individual API calls
          setTopShops(shopsRes);
          setTopCakes(cakesRes);
          setRecentEnquiries(enquiriesRes);
          setRevenueData(revenueRes);
          
          // Calculate basic stats from available data
          const calculatedStats: SuperAdminDashboardStats = {
            totalRevenue: 0,
            totalOrders: 0,
            activeShops: allShopsRes?.data?.filter(shop => shop.status === 'active').length || 0,
            inactiveShops: allShopsRes?.data?.filter(shop => shop.status === 'inactive').length || 0,
            totalCustomers: 0,
            totalCakes: 0,
            pendingEnquiries: enquiriesRes?.filter(enquiry => enquiry.status === 'pending').length || 0,
            approvedEnquiries: enquiriesRes?.filter(enquiry => enquiry.status === 'approved').length || 0,
            rejectedEnquiries: enquiriesRes?.filter(enquiry => enquiry.status === 'rejected').length || 0,
            revenueGrowth: 0,
            ordersGrowth: 0,
            shopsGrowth: 0,
            customersGrowth: 0,
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

  const handleToggleShopStatus = async (shopId: string) => {
    try {
      await dispatch(toggleShopStatus(shopId)).unwrap();
      toast.success('Shop status updated successfully');
      // Refresh data
      const shopsRes = await dispatch(fetchShops({ limit: 10 })).unwrap();
      const updatedTopShops = shopsRes?.data?.slice(0, 5) || [];
      setTopShops(updatedTopShops);
    } catch (error) {
      toast.error('Failed to update shop status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "rejected":
      case "inactive":
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
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete overview of the entire platform
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link href="/super_admin/shops">
            <Button variant="outline">
              <Store className="w-4 h-4 mr-2" />
              Manage Shops
            </Button>
          </Link>
          <Link href="/super_admin/enquiries">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Enquiries
            </Button>
          </Link>
        </div>
      </div>

      {/* System Stats Cards */}
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
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeShops || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.inactiveShops || 0} inactive shops
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats?.customersGrowth && stats.customersGrowth > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{stats.customersGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 mr-1 text-red-600" />
                  <span className="text-red-600">{stats?.customersGrowth || 0}%</span>
                </>
              )}
              <span className="ml-1">growth</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Enquiries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingEnquiries || 0}</div>
            <div className="text-xs text-muted-foreground">
              Need attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cakes</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCakes || 0}</div>
            <div className="text-xs text-muted-foreground">
              Across all shops
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Enquiries</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedEnquiries || 0}</div>
            <div className="text-xs text-muted-foreground">
              Successfully onboarded
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Enquiries</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.rejectedEnquiries || 0}</div>
            <div className="text-xs text-muted-foreground">
              Not approved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Analytics</CardTitle>
                  <CardDescription>Platform-wide performance metrics</CardDescription>
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
              <div className="mb-4">
                <div className="flex gap-1">
                  {(['revenue', 'orders', 'shops', 'customers', 'combined'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={chartType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <SuperAdminRevenueChart data={revenueData} type={chartType} period={chartPeriod} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/super_admin/shops">
              <Button variant="outline" className="w-full justify-start">
                <Store className="w-4 h-4 mr-2" />
                Manage Shops
              </Button>
            </Link>
            <Link href="/super_admin/enquiries">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Review Enquiries
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Security Center
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="w-4 h-4 mr-2" />
              System Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Enquiries and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Enquiries</CardTitle>
              <CardDescription>Latest shop registration requests</CardDescription>
            </div>
            <Link href="/super_admin/enquiries">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnquiries.length > 0 ? (
                recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{enquiry.shopname}</span>
                        <Badge className={getStatusColor(enquiry.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(enquiry.status)}
                            {enquiry.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {enquiry.ownername} • {enquiry.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent enquiries</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Shops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Shops</CardTitle>
              <CardDescription>Best performing shops</CardDescription>
            </div>
            <Link href="/super_admin/shops">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topShops.length > 0 ? (
                topShops.map((shop, index) => (
                  <div key={shop.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{shop.shopname}</div>
                        <div className="text-sm text-muted-foreground">
                          {shop.city}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(shop.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {shop.totalOrders} orders
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No shop data yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Cakes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Cakes</CardTitle>
              <CardDescription>Most popular across platform</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
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
                          {cake.shopName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(cake.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {cake.totalOrders} orders
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
