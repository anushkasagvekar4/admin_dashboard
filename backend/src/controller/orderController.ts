import { Request, Response } from "express";
import { Order } from "../models/orders";
import { OrderItem } from "../models/orderItems";

// 🟩 Get All Orders (with customer + items + cake)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.query()
      .withGraphFetched("[customer, items.[cake]]")
      .orderBy("created_at", "desc");

    res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: orders,
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

// 🟩 Get Order by ID (with all related data)
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.query()
      .findById(id)
      .withGraphFetched("[customer, items.[cake]]");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
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
        created_at: new Date(),
        updated_at: new Date(),
      });

      const orderItems = items.map((item: any) => ({
        order_id: insertedOrder.id,
        cake_id: item.cake_id,
        qty: item.qty,
        price: item.price,
        created_at: new Date(),
        updated_at: new Date(),
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

// 🟩 Delete Order (and related items)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const deleted = await Order.transaction(async (trx) => {
      // delete related items first
      await OrderItem.query(trx).delete().where("order_id", id);
      // then delete order
      const deletedCount = await Order.query(trx).deleteById(id);
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
