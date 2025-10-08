import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getMyCustomer,
  updateCustomer,
  updateCustomerStatus,
  updateMyCustomer,
} from "../controller/customerController";
import ensureAuthenticated from "../middleware/Auth";
import { signin } from "../controller/authController";

const customerRouter = Router();

// customerRouter.post("/auth/signin", ensureAuthenticated, signin);
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
customerRouter.get(
  "/getCustomerById/:id",
  ensureAuthenticated,
  getCustomerById
);
customerRouter.get("/getAllCustomers", ensureAuthenticated, getAllCustomers);
customerRouter.get("getMyCustomer/me", ensureAuthenticated, getMyCustomer);
customerRouter.patch(
  "updateMyCustomer/me",
  ensureAuthenticated,
  updateMyCustomer
);

export default customerRouter;
