import { Request, Response } from "express";
import { Customer } from "../models/customer";
import { AuthRequest } from "../middleware/Auth";

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    console.log("👉 Received payload:", req.body);

    if (!req.user || req.user.role !== "customer") {
      return res
        .status(403)
        .json({ success: false, message: "Only customers can create profile" });
    }

    const { full_name, email, phone, address } = req.body;

    // Check if already exists
    const existing = await Customer.query()
      .where("auth_id", req.user!.id)
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const customer = await Customer.query().insert({
      auth_id: req.user!.id,
      full_name,
      email,
      phone,
      address,
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer profile created successfully",
      data: customer,
    });
  } catch (err: any) {
    console.error("Error creating customer:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Get All Customers (for super_admin)
 */
export const getAllCustomers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admin can view all customers",
      });
    }

    const customers = await Customer.query().withGraphFetched("auth");

    return res.status(200).json({
      success: true,
      message: "All customers fetched successfully",
      data: customers,
    });
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Get Customer by ID (for admin/super_admin)
 */
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.query().findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (err: any) {
    console.error("Error fetching customer by ID:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Update Customer (admin or super_admin)
 */
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, address, status } = req.body;

    const updated = await Customer.query().patchAndFetchById(id, {
      full_name,
      email,
      phone,
      address,
      status,
      updated_at: new Date(),
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating customer:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Update Customer Status (admin)
 */
export const updateCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "shop_admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update customer status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updated = await Customer.query().patchAndFetchById(id, {
      status,
      updated_at: new Date(),
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer status updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating customer status:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Get Logged-in Customer Profile
 */
export const getMyCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not a customer" });
    }

    const customer = await Customer.query()
      .where("auth_id", req.user!.id)
      .first();

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Customer profile fetched successfully",
      data: customer,
    });
  } catch (err: any) {
    console.error("Error fetching my profile:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

/**
 * 🧱 Update Logged-in Customer Profile
 */
export const updateMyCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: not a customer" });
    }

    const { full_name, email, phone, address } = req.body;

    const existing = await Customer.query()
      .where("auth_id", req.user!.id)
      .first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const updated = await Customer.query().patchAndFetchById(existing.id, {
      full_name,
      email,
      phone,
      address,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error("Error updating my profile:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};
