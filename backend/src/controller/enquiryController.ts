import { Enquiry } from "../models/enquiry";
import { Shop } from "../models/shop";
import { Auth } from "../models/auth";
import { AuthRequest } from "../middleware/Auth";

import { Request, Response, RequestHandler } from "express";

// Create a new shop enquiry (no authentication required)
export const createEnquiry: RequestHandler = async (req, res) => {
  try {
    console.log("=== createEnquiry called ===");

    const { shopname, ownername, email, phone, address, city } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to submit an enquiry",
      });
    }

    console.log("Creating enquiry for email:", email);

    // Check if user already has a pending or approved enquiry
    const existingEnquiry = await Enquiry.query()
      .where("email", email)
      .whereIn("status", ["pending", "approved"])
      .first();

    if (existingEnquiry) {
      if (existingEnquiry.status === "pending") {
        return res.status(409).json({
          success: false,
          message:
            "You already have a pending enquiry. Please wait for admin approval.",
          data: existingEnquiry,
        });
      } else if (existingEnquiry.status === "approved") {
        return res.status(409).json({
          success: false,
          message:
            "You already have an approved shop. You cannot submit another enquiry.",
          data: existingEnquiry,
        });
      }
    }

    // Create enquiry directly from body
    const enquiryData = {
      shopname,
      ownername,
      email,
      phone,
      address,
      city,
      status: "pending" as const,
    };

    const newEnquiry = await Enquiry.query().insertAndFetch(enquiryData);

    return res.status(201).json({
      success: true,
      message: "Shop enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (err: any) {
    console.error("Create enquiry error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getEnquiries: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("=== getEnquiries called (no auth required) ===");

    const enquiries = await Enquiry.query().orderBy("created_at", "desc");

    console.log("Enquiries fetched:", enquiries.length);

    res.status(200).json({ success: true, data: enquiries });
  } catch (err: any) {
    console.error("Get enquiries error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveEnquiry: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.query().findById(id);
    if (!enquiry)
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    if (enquiry.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Enquiry already processed" });

    await enquiry.$query().patch({ status: "approved" });

    const newShop = await Shop.query().insertAndFetch({
      shopname: enquiry.shopname,
      ownername: enquiry.ownername,
      email: enquiry.email,
      phone: enquiry.phone,
      address: enquiry.address,
      city: enquiry.city,
      status: "active",
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Enquiry approved & shop created",
        data: newShop,
      });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectEnquiry: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const enquiry = await Enquiry.query().findById(id);
    if (!enquiry)
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    if (enquiry.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Enquiry already processed" });

    await enquiry.$query().patch({
      status: "rejected",
      reason: reason || "Not specified",
    });

    res
      .status(200)
      .json({ success: true, message: "Enquiry rejected successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check current user's enquiry status
export const checkUserEnquiryStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log("=== checkUserEnquiryStatus called ===");
    console.log("req.user:", req.user);

    if (!req.user) {
      console.log("No user attached to request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user info",
      });
    }

    const userId = req.user.id;
    console.log("Checking enquiry status for user ID:", userId);

    // First, get the user's email from the Auth table
    const authUser = await Auth.query().findById(userId);
    if (!authUser) {
      console.log("User not found in Auth table");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userEmail = authUser.email;
    console.log("User email found:", userEmail);

    // Find the user's enquiry based on their email
    const enquiry = await Enquiry.query()
      .where("email", userEmail)
      .orderBy("created_at", "desc")
      .first();

    console.log("User enquiry found:", enquiry);

    if (!enquiry) {
      console.log("No enquiry found for this user");
      return res.status(200).json({
        success: true,
        data: {
          hasEnquiry: false,
          status: null,
          enquiry: null,
        },
      });
    }

    console.log("Returning enquiry status:", enquiry.status);
    res.status(200).json({
      success: true,
      data: {
        hasEnquiry: true,
        status: enquiry.status,
        enquiry: enquiry,
      },
    });
  } catch (err: any) {
    console.error("Check user enquiry status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
