import express from "express";
import { getSuperAdminDashboard } from "../controller/superAdminController";
import ensureAuthenticated from "../middleware/Auth";

const superAdminRouter = express.Router();

superAdminRouter.get("/dashboard", ensureAuthenticated, getSuperAdminDashboard);

export default superAdminRouter;
