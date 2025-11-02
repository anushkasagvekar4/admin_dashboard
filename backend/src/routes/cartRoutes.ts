import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controller/cartController";

const cartRouter = Router();

cartRouter.get("/getCart", ensureAuthenticated, getCart);
cartRouter.post("/addToCart", ensureAuthenticated, addToCart);
cartRouter.patch("/updateCartItem/:id", ensureAuthenticated, updateCartItem);
cartRouter.delete("/removeCartItem/:id", ensureAuthenticated, removeCartItem);

export default cartRouter;
