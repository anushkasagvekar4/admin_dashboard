import { Router } from "express";
import {
  approveEnquiry,
  createEnquiry,
  getEnquiries,
  rejectEnquiry,
  checkUserEnquiryStatus,
} from "../controller/enquiryController";
import ensureAuthenticated from "../middleware/Auth";

const enquiryRouter = Router();

// Create a new enquiry (authenticated users only)
enquiryRouter.post("/createEnquiry", createEnquiry);

// Get all enquiries (super_admin only)
enquiryRouter.get("/getEnquiries", getEnquiries);

// Approve enquiry (super_admin only)
enquiryRouter.patch("/approveEnquiry/:id", approveEnquiry);

// Reject enquiry (super_admin only)
enquiryRouter.patch("/rejectEnquiry/:id", rejectEnquiry);

// Check current user's enquiry status (authenticated users)
enquiryRouter.get(
  "/checkUserEnquiryStatus",
  ensureAuthenticated,
  checkUserEnquiryStatus
);

export default enquiryRouter;
