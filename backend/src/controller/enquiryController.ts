import { Enquiry } from "../models/enquiry";
import { Shop } from "../models/shop";
import { Auth } from "../models/auth";
import { Request, Response, RequestHandler } from "express";
import { AuthRequest } from "../middleware/Auth";
import {
  sendEmail,
  sendEnquiryApprovedEmail,
  sendEnquiryRejectedEmail,
} from "../services/emailService";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://yourfrontend.com";

/**
 * 📨 Create a new shop enquiry
 */
export const createEnquiry: RequestHandler = async (req, res) => {
  try {
    const { shopname, ownername, email, phone, address, city } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to submit an enquiry",
      });
    }

    const existingEnquiry = await Enquiry.query()
      .where("email", email)
      .whereIn("status", ["pending", "approved"])
      .first();

    if (existingEnquiry) {
      const message =
        existingEnquiry.status === "pending"
          ? "You already have a pending enquiry. Please wait for admin approval."
          : "You already have an approved shop. You cannot submit another enquiry.";
      return res
        .status(409)
        .json({ success: false, message, data: existingEnquiry });
    }

    const newEnquiry = await Enquiry.query().insertAndFetch({
      shopname,
      ownername,
      email,
      phone,
      address,
      city,
      status: "pending",
    });

    // Acknowledgement email
    await sendEmail({
      to: email,
      subject: "Your CakeHaven Shop Enquiry Received",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color:#e63946;">We’ve received your enquiry 🎉</h2>
          <p>Hi ${ownername},</p>
          <p>Thank you for submitting your shop enquiry. Our team will review your details and notify you via email.</p>
          <p>You can check your enquiry status anytime by logging in.</p>
          <p>– The CakeHaven Team 🍰</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Shop enquiry submitted successfully",
      data: newEnquiry,
      redirect: "/auth/enquiry/thank-you",
    });
  } catch (err: any) {
    console.error("Create enquiry error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📋 Get all enquiries (super admin)
 */
export const getEnquiries: RequestHandler = async (req, res) => {
  try {
    const enquiries = await Enquiry.query().orderBy("created_at", "desc");
    res.status(200).json({ success: true, data: enquiries });
  } catch (err: any) {
    console.error("Get enquiries error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ✅ Approve enquiry (super admin)
 */
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

    // 🎉 Send approval email
    await sendEnquiryApprovedEmail(enquiry.email, enquiry.shopname);

    res.status(200).json({
      success: true,
      message: "Enquiry approved, shop created, and approval email sent",
      data: newShop,
    });
  } catch (err: any) {
    console.error("Approve enquiry error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ❌ Reject enquiry (super admin)
 */
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

    // 🚫 Send rejection email
    await sendEnquiryRejectedEmail(enquiry.email, enquiry.shopname, reason);

    res.status(200).json({
      success: true,
      message: "Enquiry rejected and email sent",
    });
  } catch (err: any) {
    console.error("Reject enquiry error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔍 Check user enquiry status (for redirect logic)
 */
export const checkUserEnquiryStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const authUser = await Auth.query().findById(req.user.id);
    if (!authUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const enquiry = await Enquiry.query()
      .where("email", authUser.email)
      .orderBy("created_at", "desc")
      .first();

    if (!enquiry) {
      return res.status(200).json({
        success: true,
        data: { hasEnquiry: false, status: null, enquiry: null },
      });
    }

    res.status(200).json({
      success: true,
      data: { hasEnquiry: true, status: enquiry.status, enquiry },
    });
  } catch (err: any) {
    console.error("Check enquiry status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
