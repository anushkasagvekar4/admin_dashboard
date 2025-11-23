"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppDispatch, RootState } from "@/app/store/Store";
import { fetchAllOrders } from "@/app/features/orders/orderApi";
import { Package, Truck, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import api from "@/app/utils/axios";

interface Order {
  id: string;
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
  const [directApiData, setDirectApiData] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
    
    // Test direct API call
    const testDirectApi = async () => {
      try {
        const response = await api.get("/orders/getAllOrders");
        console.log("Direct API Response:", response.data);
        setDirectApiData(response.data);
      } catch (error) {
        console.error("Direct API Error:", error);
      }
    };
    
    testDirectApi();
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log("Orders Redux State:", { orders, loading, error, user });
    console.log("Direct API Data:", directApiData);
  }, [orders, loading, error, user, directApiData]);

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
        <p className="text-gray-600">{error}</p>
        <Button 
          onClick={() => dispatch(fetchAllOrders())}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const ordersArray = Array.isArray(orders) && orders.length > 0 
    ? orders 
    : (directApiData?.data || []);

  const filteredOrders = user
    ? ordersArray.filter((order) => {
        // Check nested customer email
        if (order.customer?.email === user) return true;
        
        // Check root level customer fields (for backward compatibility)
        if ((order as any).customerEmail === user) return true;
        if ((order as any).customer_email === user) return true;
        
        // Check if customer data is null but we have other customer info
        if (!order.customer && (order as any).customerEmail === user) return true;
        if (!order.customer && (order as any).customer_email === user) return true;
        
        // For now, show all orders if customer data is missing (temporary fix)
        if (!order.customer) {
          console.log("Order with null customer:", order.id);
          return true; // Show all orders temporarily
        }
        
        return false;
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
      {/* Temporary Debug Panel */}
      <div className="mb-4 p-4 bg-yellow-100 rounded text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>User: {user || 'Not logged in'}</p>
        <p>Redux Orders count: {Array.isArray(orders) ? orders.length : 'Not an array'}</p>
        <p>Direct API Data: {directApiData ? `Success - ${directApiData.data?.length || 0} orders` : 'Loading...'}</p>
        <p>Filtered orders count: {filteredOrders.length}</p>
        <p>Customer Data Issue: {ordersArray[0]?.customer === null ? 'YES - Customer data is null in orders' : 'No'}</p>
        <p>Sample order: {ordersArray[0] ? JSON.stringify(ordersArray[0], null, 2) : 'No orders'}</p>
        <p>Direct API Sample: {directApiData?.data?.[0] ? JSON.stringify(directApiData.data[0], null, 2) : 'No direct data'}</p>
      </div>

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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">#{order.orderNo || 'N/A'}</td>
                      <td className="p-3">
                        {order.items && order.items.length > 0
                          ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                          : "No items"}
                      </td>
                      <td className="p-3 font-semibold">
                        ₹{order.items
                          ? order.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 0)), 0).toFixed(2)
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
                        <Link href={`/customer/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
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
          {filteredOrders.map((order) => (
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
                        ? order.items.reduce((sum, i) => sum + ((i.price || 0) * (i.qty || 0)), 0).toFixed(2)
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
                <Link href={`/customer/orders/${order.id}`} className="w-full">
                  <Button className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details & Track
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
