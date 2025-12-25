import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  getShopAdminDashboard,
  getShopOrders,
  updateShopOrderStatus,
  getShopOrderDetails,
  getShopAnalytics,
  getShopReviews,
  respondToReview,
  getReviewAnalytics,
  getShopInventory,
  updateInventoryStock,
  getInventoryAnalytics,
  getShopDeliveries,
  scheduleDelivery,
  updateDeliveryStatus,
  getDeliveryAnalytics,
  getShopCommunications,
  sendMessageToCustomer,
  sendBulkMessage,
  getCommunicationAnalytics,
} from "../controller/shopAdminController";

const router = Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// Dashboard & Analytics
router.get("/dashboard", getShopAdminDashboard);
router.get("/analytics", getShopAnalytics);

// Order Management
router.get("/orders", getShopOrders);
router.get("/orders/:id", getShopOrderDetails);
router.put("/orders/:id/status", updateShopOrderStatus);

// Review Management
router.get("/reviews", getShopReviews);
router.post("/reviews/:id/respond", respondToReview);
router.get("/reviews/analytics", getReviewAnalytics);

// Inventory Management
router.get("/inventory", getShopInventory);
router.put("/inventory/:id/stock", updateInventoryStock);
router.get("/inventory/analytics", getInventoryAnalytics);

// Delivery Management
router.get("/deliveries", getShopDeliveries);
router.post("/deliveries/schedule", scheduleDelivery);
router.put("/deliveries/:id/status", updateDeliveryStatus);
router.get("/deliveries/analytics", getDeliveryAnalytics);

// Customer Communication
router.get("/communications", getShopCommunications);
router.post("/communications/send", sendMessageToCustomer);
router.post("/communications/bulk-send", sendBulkMessage);
router.get("/communications/analytics", getCommunicationAnalytics);

export default router;
