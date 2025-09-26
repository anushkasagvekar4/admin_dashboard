import { Router } from "express";
import {
  approveEnquiry,
  createEnquiry,
  getEnquiries,
  rejectEnquiry,
} from "../controller/enquiryController";
import ensureAuthenticated from "../middleware/Auth";

const enquiryRouter = Router();

// Create a new enquiry (anyone)
enquiryRouter.post("/createEnquiry", createEnquiry);

// Get all enquiries (super_admin only)
enquiryRouter.get("/getEnquiries", ensureAuthenticated, getEnquiries);

// Approve enquiry (super_admin only)
enquiryRouter.patch("/approveEnquiry/:id", ensureAuthenticated, approveEnquiry);

// Reject enquiry (super_admin only)
enquiryRouter.patch("/rejectEnquiry/:id", ensureAuthenticated, rejectEnquiry);

export default enquiryRouter;
