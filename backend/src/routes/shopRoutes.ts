import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  getShopById,
  getShops,
  toggleShopStatus,
  updateShop,
} from "../controller/shopController";
import { signin, signup } from "../controller/authController";

const shopRouter = Router();
shopRouter.post("/auth/signup ", ensureAuthenticated, signup);
shopRouter.post("/auth/signin ", ensureAuthenticated, signin);

shopRouter.get("/getShops", ensureAuthenticated, getShops);
// Get single shop by ID (super_admin only)
shopRouter.get("/getShopById/:id", ensureAuthenticated, getShopById);

// Toggle shop active/inactive instead of delete (super_admin only)
shopRouter.patch(
  "/toggleShopStatus/:id",
  ensureAuthenticated,
  toggleShopStatus
);
shopRouter.patch("/updateShop/:id", ensureAuthenticated, updateShop);

export default shopRouter;
