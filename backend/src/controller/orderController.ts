import { Request, Response } from "express";
import { Order } from "../models/orders";
import { OrderItem } from "../models/orderItems";
import { Shop } from "../models/shop";

interface OrderWithCustomerFields {
  id: number;
  order_no: number;
  customer_id: string;
  status: "Pending" | "Completed" | "Cancelled";
  tracking_status: "Order Placed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  created_at: string;
  updated_at: string;
  // Additional customer fields from JOIN
  customer_full_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
}

// 🟩 Get All Orders (with customer + items + cake)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.query()
      .select(
        'orders.*',
        'customers.id as customer_id',
        'customers.full_name as customer_full_name',
        'customers.email as customer_email',
        'customers.phone as customer_phone',
        'customers.address as customer_address'
      )
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .orderBy('orders.created_at', 'desc');

    // For each order, fetch its items with cake details
    const ordersWithItems = await Promise.all(
      orders.map(async (order: OrderWithCustomerFields): Promise<any> => {
        const items = await OrderItem.query()
          .select(
            'order_items.*',
            'cakes.cake_name',
            'cakes.images'
          )
          .leftJoin('cakes', 'order_items.cake_id', 'cakes.id')
          .where('order_items.order_id', order.id);

        // Transform the order object to match expected format
        return {
          id: order.id,
          orderNo: order.order_no,
          customerId: order.customer_id,
          status: order.status,
          trackingStatus: order.tracking_status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          customer: order.customer_id ? {
            id: order.customer_id,
            full_name: order.customer_full_name || order.customer_email, // fallback to email if name missing
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
          } : null,
          items: items.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            cake_id: item.cake_id,
            qty: item.qty,
            price: Number(item.price), // Convert to number
            created_at: item.created_at,
            updated_at: item.updated_at,
            cake: item.cake_name ? {
              id: item.cake_id,
              cake_name: item.cake_name,
              images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
            } : null,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: ordersWithItems,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// 🟩 Get Orders for Shop Admin (only orders containing their cakes)
export const getShopOrders = async (req: Request, res: Response) => {
  try {
    const authId = (req as any).user?.id;
    console.log('Shop orders request - Auth ID:', authId, 'User:', (req as any).user);

    if (!authId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    // First get the shop for this shop admin
    const shop = await Shop.query().where('auth_id', authId).first();
    console.log('Found shop:', shop);
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        message: "No shop found for this admin. Please create a shop first.",
        data: [], // Return empty array instead of error
      });
    }

    // Get orders that contain items from this shop's cakes
    const orders = await Order.query()
      .select(
        'orders.*',
        'customers.id as customer_id',
        'customers.full_name as customer_full_name',
        'customers.email as customer_email',
        'customers.phone as customer_phone',
        'customers.address as customer_address'
      )
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .whereExists(
        OrderItem.query()
          .join('cakes', 'order_items.cake_id', 'cakes.id')
          .where('cakes.shopId', shop.id)
          .where('order_items.order_id', Order.raw('orders.id'))
      )
      .orderBy('orders.created_at', 'desc');

    // For each order, fetch its items with cake details (only items from this shop)
    const ordersWithItems = await Promise.all(
      orders.map(async (order: OrderWithCustomerFields): Promise<any> => {
        const items = await OrderItem.query()
          .select(
            'order_items.*',
            'cakes.cake_name',
            'cakes.images'
          )
          .leftJoin('cakes', 'order_items.cake_id', 'cakes.id')
          .where('order_items.order_id', order.id)
          .where('cakes.shopId', shop.id); // Only show items from this shop

        // Transform the order object to match expected format
        return {
          id: order.id,
          orderNo: order.order_no,
          customerId: order.customer_id,
          status: order.status,
          trackingStatus: order.tracking_status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          customer: order.customer_id ? {
            id: order.customer_id,
            full_name: order.customer_full_name || order.customer_email,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
          } : null,
          items: items.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            cake_id: item.cake_id,
            qty: item.qty,
            price: Number(item.price),
            created_at: item.created_at,
            updated_at: item.updated_at,
            cake: item.cake_name ? {
              id: item.cake_id,
              cake_name: item.cake_name,
              images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
            } : null,
          })),
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Shop orders fetched successfully",
      data: ordersWithItems,
    });
  } catch (error: any) {
    console.error("Error fetching shop orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop orders",
      error: error.message,
    });
  }
};

// 🟩 Get Order by ID (with all related data)
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.query()
      .select(
        'orders.*',
        'customers.id as customer_id',
        'customers.full_name as customer_full_name',
        'customers.email as customer_email',
        'customers.phone as customer_phone',
        'customers.address as customer_address'
      )
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .where('orders.id', orderId)
      .first() as OrderWithCustomerFields | undefined;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch items with cake details
    const items = await OrderItem.query()
      .select(
        'order_items.*',
        'cakes.cake_name',
        'cakes.images'
      )
      .leftJoin('cakes', 'order_items.cake_id', 'cakes.id')
      .where('order_items.order_id', order.id);

    // Transform the order object to match expected format
    const orderWithItems = {
      id: order.id,
      orderNo: order.order_no,
      customerId: order.customer_id,
      status: order.status,
      trackingStatus: order.tracking_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      customer: order.customer_id ? {
        id: order.customer_id,
        full_name: order.customer_full_name || order.customer_email,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
      } : null,
      items: items.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        cake_id: item.cake_id,
        qty: item.qty,
        price: Number(item.price),
        created_at: item.created_at,
        updated_at: item.updated_at,
        cake: item.cake_name ? {
          id: item.cake_id,
          cake_name: item.cake_name,
          images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
        } : null,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: orderWithItems,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// 🟩 Create New Order (with items)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { order_no, customer_id, status, items } = req.body;

    if (!order_no || !customer_id || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: order_no, customer_id, and items (array)",
      });
    }

    // Start a transaction to ensure atomic insert
    const newOrder = await Order.transaction(async (trx) => {
      const insertedOrder = await Order.query(trx).insert({
        order_no,
        customer_id,
        status: status || "Pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const orderItems = items.map((item: any) => ({
        order_id: insertedOrder.id,
        cake_id: item.cake_id,
        qty: item.qty,
        price: item.price,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await OrderItem.query(trx).insert(orderItems);

      return insertedOrder;
    });

    // Fetch with relations
    const orderWithRelations = await Order.query()
      .findById(newOrder.id)
      .withGraphFetched("[customer, items.[cake]]");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: orderWithRelations,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// 🟩 Update Order Status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    const { tracking_status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    if (!tracking_status || !["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(tracking_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tracking status. Must be one of: Order Placed, Processing, Shipped, Out for Delivery, Delivered, Cancelled",
      });
    }

    const updatedOrder = await Order.query()
      .findById(orderId)
      .patch({
        tracking_status,
        updated_at: new Date().toISOString(),
      });

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch the updated order with relations
    const order = await Order.query()
      .select(
        'orders.*',
        'customers.id as customer_id',
        'customers.full_name as customer_full_name',
        'customers.email as customer_email',
        'customers.phone as customer_phone',
        'customers.address as customer_address'
      )
      .leftJoin('customers', 'orders.customer_id', 'customers.id')
      .where('orders.id', orderId)
      .first() as OrderWithCustomerFields | undefined;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found after update",
      });
    }

    // Fetch items with cake details
    const items = await OrderItem.query()
      .select(
        'order_items.*',
        'cakes.cake_name',
        'cakes.images'
      )
      .leftJoin('cakes', 'order_items.cake_id', 'cakes.id')
      .where('order_items.order_id', order.id);

    // Transform the order object to match expected format
    const orderWithItems = {
      id: order.id,
      orderNo: order.order_no,
      customerId: order.customer_id,
      status: order.status,
      trackingStatus: order.tracking_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      customer: order.customer_id ? {
        id: order.customer_id,
        full_name: order.customer_full_name || order.customer_email,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
      } : null,
      items: items.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        cake_id: item.cake_id,
        qty: item.qty,
        price: Number(item.price),
        created_at: item.created_at,
        updated_at: item.updated_at,
        cake: item.cake_name ? {
          id: item.cake_id,
          cake_name: item.cake_name,
          images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
        } : null,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Order tracking status updated successfully",
      data: orderWithItems,
    });
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order tracking status",
      error: error.message,
    });
  }
};

// 🟩 Delete Order (and related items)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const deleted = await Order.transaction(async (trx) => {
      // delete related items first
      await OrderItem.query(trx).delete().where("order_id", orderId);
      // then delete order
      const deletedCount = await Order.query(trx).deleteById(orderId);
      return deletedCount;
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order and related items deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};
