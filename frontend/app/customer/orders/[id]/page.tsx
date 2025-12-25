"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { SectionHeading } from "@/app/Home/SectionHeading";
import { Truck, CheckCircle2, Clock, Package, Phone, Mail, MapPin, Calendar, CreditCard, Wifi, WifiOff } from "lucide-react";
import { fetchOrderById, startRealTimeTracking, subscribeToTrackingUpdates, unsubscribeFromTrackingUpdates } from "@/app/features/orders/orderApi";
import { updateTracking, toggleRealTimeUpdates } from "@/app/features/orders/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeliveryInstructionsForm from "@/app/components/orders/DeliveryInstructionsForm";
import { Tracking } from "@/app/features/orders/trackingService";

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

export default function CustomerTracker() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, loading, tracking, realTimeUpdates } = useSelector(
    (state: RootState) => state.orders
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const steps = [
    { name: "Order Placed", icon: Package, description: "Your order has been received" },
    { name: "Baking", icon: Clock, description: "Your cake is being prepared" },
    { name: "Dispatched", icon: Truck, description: "Your order is on the way" },
    { name: "Delivered", icon: CheckCircle2, description: "Your order has been delivered" }
  ];

  // Map order status to step number for tracking
  const getStep = (status: string) => {
    switch (status) {
      case "Pending":
        return 2;
      case "Completed":
        return 4;
      case "Cancelled":
        return 0;
      default:
        return 1;
    }
  };

  // Calculate estimated delivery time
  const calculateEstimatedDelivery = (status: string, createdAt: string) => {
    if (status === "Completed") return "Delivered";
    if (status === "Cancelled") return "Cancelled";
    
    const orderDate = new Date(createdAt);
    const estimatedDays = status === "Pending" ? 2 : 1;
    const deliveryDate = new Date(orderDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString();
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchOrderById(id));
      dispatch(startRealTimeTracking(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && typeof id === "string" && realTimeUpdates) {
      const websocket = subscribeToTrackingUpdates(id, dispatch);
      return () => {
        unsubscribeFromTrackingUpdates();
      };
    }
  }, [dispatch, id, realTimeUpdates]);

  useEffect(() => {
    if (currentOrder) {
      setEstimatedDelivery(calculateEstimatedDelivery(currentOrder.status, currentOrder.createdAt));
    }
  }, [currentOrder]);

  useEffect(() => {
    if (tracking) {
      setLastUpdate(new Date());
    }
  }, [tracking]);

  if (loading || !currentOrder) return <p>Loading order tracking...</p>;

  const currentStep = getStep(currentOrder.status);
  const itemsList = currentOrder.items
    ?.map((i) => i.cake?.cake_name)
    .filter(Boolean)
    .join(", ") || "No items";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Order Tracker</h1>
        <p className="text-muted-foreground mt-2">Follow your cake from oven to doorstep</p>
      </div>

      {/* Real-time Updates Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {realTimeUpdates ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-gray-400" />}
              Live Tracking
            </CardTitle>
            <Button
              variant={realTimeUpdates ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(toggleRealTimeUpdates())}
            >
              {realTimeUpdates ? "Live Updates On" : "Enable Live Updates"}
            </Button>
          </div>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Order #{currentOrder.orderNo}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{itemsList}</p>
            </div>
            <Badge 
              variant={currentOrder.status === "Completed" ? "default" : 
                      currentOrder.status === "Cancelled" ? "destructive" : "secondary"}
            >
              {currentOrder.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(currentOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Est. Delivery</p>
                <p className="text-sm text-muted-foreground">{estimatedDelivery}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-sm font-semibold">
                  ₹{currentOrder.items?.reduce((sum: number, item: OrderItem) => sum + (item.price * item.qty), 0).toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isPending = stepNumber > currentStep;
              
              return (
                <div key={step.name} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                        isCompleted 
                          ? "bg-green-100 border-green-500 text-green-600"
                          : isCurrent 
                          ? "bg-blue-100 border-blue-500 text-blue-600"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-16 mt-2 ${
                        isCompleted ? "bg-green-300" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? "text-green-700" : 
                        isCurrent ? "text-blue-700" : 
                        "text-gray-500"
                      }`}>
                        {step.name}
                      </h3>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {isCurrent && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
                    </div>
                    <p className={`text-sm ${
                      isCompleted ? "text-green-600" : 
                      isCurrent ? "text-blue-600" : 
                      "text-gray-500"
                    }`}>
                      {step.description}
                    </p>
                    {isCurrent && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          {currentOrder.status === "Pending" 
                            ? "Your cake is being prepared with care. We'll notify you when it's ready for delivery."
                            : currentOrder.status === "Completed"
                            ? "Your order has been successfully delivered!"
                            : "Your order is on its way to your address."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Instructions */}
      <DeliveryInstructionsForm orderId={id!} isEditable={currentOrder.status === 'Pending'} />

      {/* Delivery Information */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Delivery Address</p>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.customer?.address || "Address not available"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Contact Number</p>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.customer?.phone || "Phone not available"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {currentOrder.customer?.email || "Email not available"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
