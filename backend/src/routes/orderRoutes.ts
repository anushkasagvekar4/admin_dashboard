import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} from "../controller/orderController";

const orderRouter = Router();

orderRouter.post("/createOrder", ensureAuthenticated, createOrder);
orderRouter.get("/getAllOrders", ensureAuthenticated, getAllOrders);
orderRouter.get("/getCakeById/:id", ensureAuthenticated, getOrderById);
orderRouter.delete("/deleteOrder/:id", ensureAuthenticated, deleteOrder);

export default orderRouter;
