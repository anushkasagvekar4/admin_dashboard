import { Router } from "express";
import ensureAuthenticated from "../middleware/Auth";
import {
  getWebsiteSettings,
  getWebsiteSettingsAdmin,
  upsertWebsiteSettings,
  toggleMaintenanceMode,
} from "../controller/websiteSettingsController";

const websiteSettingsRouter = Router();

// Public routes
websiteSettingsRouter.get("/public", getWebsiteSettings);

// Admin routes (super_admin only)
websiteSettingsRouter.get("/admin", ensureAuthenticated, getWebsiteSettingsAdmin);
websiteSettingsRouter.put("/admin", ensureAuthenticated, upsertWebsiteSettings);
websiteSettingsRouter.patch("/admin/maintenance", ensureAuthenticated, toggleMaintenanceMode);

export default websiteSettingsRouter;
