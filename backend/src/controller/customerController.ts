import { AuthRequest } from "../middleware/Auth";
import { Customer } from "../models/customer";
import { Request, Response } from "express";

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    // ✅ Only customers can create their own account
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only customers can create their own account",
      });
    }

    const { full_name, email, address, phone } = req.body;
    const auth_id = req.user.id; // ✅ from token, not body

    if (!full_name || !email || !address || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if customer already exists with this auth_id OR email/phone
    const existing = await Customer.query()
      .where("auth_id", auth_id)
      .orWhere("email", email)
      .orWhere("phone", phone)
      .first();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists",
      });
    }

    const newCustomer = await Customer.query().insert({
      auth_id,
      full_name,
      email,
      address,
      phone,
      status: "active",
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Customer account created successfully",
      data: newCustomer,
    });
  } catch (err: any) {
    console.error("Error creating customer:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get All Customers (with search, sort, pagination)
export const getAllCustomer = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    let query = Customer.query();

    if (search) {
      query = query.where((builder) => {
        builder
          .where("full_name", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`)
          .orWhere("phone", "ilike", `%${search}%`);
      });
    }

    query = query.orderBy(sortBy as string, order as "asc" | "desc");

    const result = await query.page(pageNumber - 1, pageSize);

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: result.results,
      pagination: {
        total: result.total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Customer Status

// Update Customer Status (Only shop_admin)
export const updateCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    // ✅ Check role
    if (!req.user || req.user.role !== "shop_admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only shop_admin can update customer status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res
        .status(400)
        .json({ success: false, message: "ID and status are required" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const updatedCustomer = await Customer.query().patchAndFetchById(id, {
      status,
      updated_at: new Date(),
    });

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: `Customer ${status === "active" ? "activated" : "deactivated"}`,
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.error("Error updating customer status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update Customer (only by customer)
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only customers can update their profile",
      });
    }

    const { id } = req.params; // Customer ID from route
    const { full_name, email, address, phone } = req.body;

    // Check if this customer is updating their own profile
    const customer = await Customer.query().findById(id);

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (customer.auth_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile",
      });
    }

    // Optional: check if email already exists (when changing email)
    if (email && email !== customer.email) {
      const existingEmail = await Customer.query()
        .where("email", email)
        .first();
      if (existingEmail) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    const updatedCustomer = await Customer.query().patchAndFetchById(id, {
      full_name,
      email,
      address,
      phone,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.error("Error updating customer:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
