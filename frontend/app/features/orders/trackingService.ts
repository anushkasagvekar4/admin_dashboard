import api from "@/app/utils/axios";

interface TrackingStep {
  name: string;
  status: string;
  timestamp?: string;
  description: string;
  location?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
}

interface Tracking {
  orderNo: string;
  status: string;
  steps: TrackingStep[];
  estimatedDelivery: string;
  realTimeUpdates: boolean;
}

// WebSocket connection for real-time updates
let websocket: WebSocket | null = null;

export const connectOrderTracking = (orderId: string, onUpdate: (tracking: Tracking) => void) => {
  if (websocket) {
    websocket.close();
  }

  websocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/order-tracking/${orderId}`);

  websocket.onmessage = (event) => {
    try {
      const tracking = JSON.parse(event.data);
      onUpdate(tracking);
    } catch (error) {
      console.error('Error parsing tracking update:', error);
    }
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return websocket;
};

export const disconnectOrderTracking = () => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
};

export const getDetailedTracking = async (orderId: string): Promise<Tracking> => {
  try {
    const response = await api.get(`/orders/tracking/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    throw error;
  }
};

export const updateTrackingStep = async (orderId: string, stepData: Partial<TrackingStep>) => {
  try {
    const response = await api.put(`/orders/tracking/${orderId}/step`, stepData);
    return response.data;
  } catch (error) {
    console.error('Error updating tracking step:', error);
    throw error;
  }
};

export type { Tracking, TrackingStep };
