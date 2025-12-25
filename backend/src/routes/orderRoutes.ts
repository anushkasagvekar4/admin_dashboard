import { Router } from "express";
import {
  getAllOrders,
  getShopOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controller/orderController";
import ensureAuthenticated from "../middleware/Auth";

const orderRouter = Router();

orderRouter.get("/getAllOrders", ensureAuthenticated, getAllOrders);
orderRouter.get("/getShopOrders", ensureAuthenticated, getShopOrders);
orderRouter.get("/getOrderById/:id", ensureAuthenticated, getOrderById);
orderRouter.post("/createOrder", ensureAuthenticated, createOrder);
orderRouter.put("/updateOrderStatus/:id", ensureAuthenticated, updateOrderStatus);
orderRouter.delete("/deleteOrder/:id", ensureAuthenticated, deleteOrder);

export default orderRouter;