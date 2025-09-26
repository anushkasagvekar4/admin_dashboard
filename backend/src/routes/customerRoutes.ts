import { Router } from "express";
import {
  createCustomer,
  getAllCustomer,
  updateCustomer,
  updateCustomerStatus,
} from "../controller/customerController";
import ensureAuthenticated from "../middleware/Auth";
import { signin } from "../controller/authController";

const customerRouter = Router();

customerRouter.post("/auth/signin", ensureAuthenticated, signin);
customerRouter.post("/createCustomer", ensureAuthenticated, createCustomer);
customerRouter.put(
  "/updateCustomerStatus/:id/status",
  ensureAuthenticated,
  updateCustomerStatus
);
customerRouter.patch(
  "/updateCustomer/:id",
  ensureAuthenticated,
  updateCustomer
);
customerRouter.get("/getAllCustomer", ensureAuthenticated, getAllCustomer);

export default customerRouter;
