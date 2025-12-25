"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllOrders } from "@/app/features/orders/orderApi";
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Search, Filter, RefreshCw, ShoppingCart } from "lucide-react";
import { reorderItems, addToCartFromOrder } from "@/app/features/orders/reorderApi";
import { toast } from "react-hot-toast";

interface Order {
  id: number;
  orderNo: number;
  customerId: string;
  status: "Pending" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  cake_id: string;
  qty: number;
  price: number;
  cake?: {
    id: string;
    cake_name: string;
    images?: string[];
  };
}

export default function OrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'last7days' | 'last30days' | 'last3months'>('all');
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);


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

  const handleReorder = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error('No items available for reorder');
      return;
    }

    setReordering(order.id);
    try {
      const orderItems = order.items.map(item => ({
        cake_id: item.cake_id,
        qty: item.qty
      }));
      
      await dispatch(reorderItems(orderItems)).unwrap();
      toast.success('Order placed successfully!');
      
      // Refresh orders to show new order
      dispatch(fetchAllOrders());
    } catch (error: any) {
      toast.error(error || 'Failed to place reorder');
    } finally {
      setReordering(null);
    }
  };

  const handleAddToCart = async (order: Order) => {
    if (!order.items || order.items.length === 0) {
      toast.error('No items available to add to cart');
      return;
    }

    setReordering(order.id);
    try {
      const orderItems = order.items.map(item => ({
        cake_id: item.cake_id,
        qty: item.qty
      }));
      
      await dispatch(addToCartFromOrder(orderItems)).unwrap();
      toast.success('Items added to cart!');
    } catch (error: any) {
      toast.error(error || 'Failed to add items to cart');
    } finally {
      setReordering(null);
    }
  };

  const getOrderTrackingSteps = (status: string) => {
    const steps = [
      { name: "Order Placed", icon: Package, completed: true },
      { name: "Processing", icon: Clock, completed: status === "Completed" || status === "Cancelled" },
      { name: "Shipped", icon: Truck, completed: status === "Completed" },
      { name: "Delivered", icon: CheckCircle, completed: status === "Completed" },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
        <p className="text-gray-600">
          {typeof error === 'string' ? error : error?.message || 'An unknown error occurred'}
        </p>
        <Button 
          onClick={() => dispatch(fetchAllOrders())}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const ordersArray = Array.isArray(orders) ? orders : [];

  const filteredOrders = user
    ? ordersArray.filter((order: Order) => {
        // Customer filtering
        const isCustomerOrder = 
          order.customer?.email === user ||
          order.customerEmail === user ||
          order.customer_email === user;
        
        if (!isCustomerOrder) return false;
        
        // Search filtering
        const matchesSearch = searchTerm === '' || 
          order.orderNo?.toString().includes(searchTerm) ||
          order.items?.some(item => item.cake?.cake_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Status filtering
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        // Date filtering
        let matchesDate = true;
        if (dateFilter !== 'all' && order.createdAt) {
          const orderDate = new Date(order.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (dateFilter) {
            case 'last7days':
              matchesDate = daysDiff <= 7;
              break;
            case 'last30days':
              matchesDate = daysDiff <= 30;
              break;
            case 'last3months':
              matchesDate = daysDiff <= 90;
              break;
          }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
      })
    : [];

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Please Login</h2>
        <p className="text-gray-600">You need to be logged in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Orders</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order # or cake name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last3months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {ordersArray.length} orders
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Order #</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Tracking</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: Order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">#{order.orderNo || 'N/A'}</td>
                      <td className="p-3">
                        {order.items && order.items.length > 0
                          ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                          : "No items"}
                      </td>
                      <td className="p-3 font-semibold">
                        ₹{order.items
                          ? order.items.reduce((sum: number, i: OrderItem) => sum + ((i.price || 0) * (i.qty || 0)), 0).toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="p-3">
                        {order.createdAt 
                          ? new Date(order.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(order.status || 'Unknown')}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status || 'Unknown')}
                            {order.status || 'Unknown'}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {getOrderTrackingSteps(order.status || 'Unknown').map((step, index) => (
                            <div
                              key={index}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <step.icon className="w-3 h-3" />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/customer/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {order.status === 'Completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCart(order)}
                                disabled={reordering === order.id}
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                {reordering === order.id ? 'Adding...' : 'Add to Cart'}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReorder(order)}
                                disabled={reordering === order.id}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                {reordering === order.id ? 'Reordering...' : 'Reorder'}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order: Order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{order.orderNo || 'N/A'}</span>
                  <Badge className={getStatusColor(order.status || 'Unknown')}>
                    {order.status || 'Unknown'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {order.items && order.items.length > 0
                    ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                    : "No items"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">
                      Total: ₹
                      {order.items
                        ? order.items.reduce((sum: number, i: OrderItem) => sum + ((i.price || 0) * (i.qty || 0)), 0).toFixed(2)
                        : "0.00"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.createdAt 
                        ? `${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        : 'Date not available'}
                    </p>
                  </div>
                  
                  {/* Order Tracking */}
                  <div>
                    <p className="text-sm font-medium mb-2">Order Progress</p>
                    <div className="flex items-center gap-2">
                      {getOrderTrackingSteps(order.status || 'Unknown').map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <step.icon className="w-4 h-4" />
                          </div>
                          {index < getOrderTrackingSteps(order.status || 'Unknown').length - 1 && (
                            <div className={`w-4 h-0.5 ${
                              step.completed ? 'bg-green-300' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {getOrderTrackingSteps(order.status || 'Unknown').map((step, index) => (
                        <p key={index} className={`text-xs ${
                          step.completed ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {step.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-2">
                  <Link href={`/customer/orders/${order.id}`} className="w-full">
                    <Button className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details & Track
                    </Button>
                  </Link>
                  {order.status === 'Completed' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAddToCart(order)}
                        disabled={reordering === order.id}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {reordering === order.id ? 'Adding...' : 'Add to Cart'}
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleReorder(order)}
                        disabled={reordering === order.id}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        {reordering === order.id ? 'Reordering...' : 'Reorder'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
