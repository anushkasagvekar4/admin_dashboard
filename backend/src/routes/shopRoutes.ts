import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  getShopById,
  getShops,
  toggleShopStatus,
  updateShop,
  getActiveShops,
  getShopWithCakes,
  getCakesByShop,
} from "../controller/shopController";
import { signin, signup } from "../controller/authController";

const shopRouter = Router();
shopRouter.post("/auth/signup ", ensureAuthenticated, signup);
shopRouter.post("/auth/signin ", ensureAuthenticated, signin);

shopRouter.get("/getShops", getShops);
// Get single shop by ID (super_admin only)
shopRouter.get("/getShopById/:id", ensureAuthenticated, getShopById);

// Toggle shop active/inactive instead of delete (super_admin only)
shopRouter.patch(
  "/toggleShopStatus/:id",
  ensureAuthenticated,
  toggleShopStatus
);
shopRouter.patch("/updateShop/:id", ensureAuthenticated, updateShop);

// Public routes (no authentication required)
shopRouter.get("/public/getActiveShops", getActiveShops);
shopRouter.get("/public/getShopWithCakes/:id", getShopWithCakes);
shopRouter.get("/public/getCakesByShop/:id", getCakesByShop);

export default shopRouter;
