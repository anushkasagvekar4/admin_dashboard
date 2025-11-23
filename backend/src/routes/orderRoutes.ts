import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  deleteOrder,
} from "../controller/orderController";
import ensureAuthenticated from "../middleware/Auth";

const orderRouter = Router();

orderRouter.get("/getAllOrders", ensureAuthenticated, getAllOrders);
orderRouter.get("/getOrderById/:id", ensureAuthenticated, getOrderById);
orderRouter.post("/createOrder", ensureAuthenticated, createOrder);
orderRouter.delete("/deleteOrder/:id", ensureAuthenticated, deleteOrder);

export default orderRouter;