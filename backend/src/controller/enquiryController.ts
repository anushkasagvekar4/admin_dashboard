import { Response } from "express";
import { Enquiry } from "../models/enquiry";
import { Shop } from "../models/shop";
import { AuthRequest } from "../middleware/Auth";

// Create a new shop enquiry (anyone can submit)
export const createEnquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { shopname, ownername, email, phone, address, city } = req.body;

    const newEnquiry = await Enquiry.query().insertAndFetch({
      shopname,
      ownername,
      email,
      phone,
      address,
      city,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Shop enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (err: any) {
    console.error("Create enquiry error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all enquiries (super_admin only)
export const getEnquiries = async (req: AuthRequest, res: Response) => {
  try {
    console.log("=== getEnquiries called ===");
    console.log("req.user:", req.user);

    if (!req.user) {
      console.log("No user attached to request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user info",
      });
    }

    if (req.user.role !== "super_admin") {
      console.log(`User role is ${req.user.role} - forbidden`);
      return res.status(403).json({
        success: false,
        message: "Only super_admins can view shop enquiries",
      });
    }

    console.log("User is super_admin - fetching enquiries");

    const enquiries = await Enquiry.query().orderBy("created_at", "desc");

    console.log("Enquiries fetched:", enquiries.length);

    res.status(200).json({ success: true, data: enquiries });
  } catch (err: any) {
    console.error("Get enquiries error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Approve enquiry -> create shop
// Approve enquiry -> create shop
export const approveEnquiry = async (req: AuthRequest, res: Response) => {
  try {
    console.log("=== approveEnquiry called ===");
    console.log("req.user:", req.user);

    // Check super_admin role
    if (!req.user) {
      console.log("No user attached to request");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no user info",
      });
    }

    if (req.user.role !== "super_admin") {
      console.log(`User role is ${req.user.role} - forbidden`);
      return res.status(403).json({
        success: false,
        message: "Only super_admins can approve enquiries",
      });
    }
    console.log("User is super_admin - proceeding");

    const { id } = req.params;
    console.log("Enquiry ID from params:", id);

    const enquiry = await Enquiry.query().findById(id);
    console.log("Enquiry fetched from DB:", enquiry);

    if (!enquiry) {
      console.log("Enquiry not found");
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    if (enquiry.status !== "pending") {
      console.log("Enquiry already processed with status:", enquiry.status);
      return res
        .status(400)
        .json({ success: false, message: "Enquiry already processed" });
    }

    console.log("Updating enquiry status to 'approved'");
    await enquiry.$query().patch({ status: "approved" });

    console.log("Creating new shop from enquiry data");
    let newShop;
    try {
      newShop = await Shop.query().insertAndFetch({
        shopname: enquiry.shopname,
        ownername: enquiry.ownername,
        email: enquiry.email,
        phone: enquiry.phone,
        address: enquiry.address,
        city: enquiry.city,
        status: "active",
      });

      console.log("New shop created:", newShop);
    } catch (err: any) {
      console.error("Error creating shop:", err);
      return res.status(500).json({ success: false, message: err.message });
    }

    console.log("New shop created:", newShop);

    res.status(200).json({
      success: true,
      message: "Enquiry approved & shop created",
      data: newShop,
    });
  } catch (err: any) {
    console.error("Approve enquiry error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject enquiry (with optional reason)
export const rejectEnquiry = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can reject enquiries",
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const enquiry = await Enquiry.query().findById(id);

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    if (enquiry.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Enquiry already processed" });
    }

    await enquiry.$query().patch({
      status: "rejected",
      reason: reason || "Not specified",
    });

    res.status(200).json({
      success: true,
      message: "Enquiry rejected successfully",
    });
  } catch (err: any) {
    console.error("Reject enquiry error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
