import { AuthRequest } from "../middleware/Auth";
import { Customer } from "../models/customer";
import { Request, Response } from "express";

// 🧩 Create Customer (only for logged-in customer)
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only customers can create their own account",
      });
    }

    const { full_name, email, address, phone } = req.body;
    const auth_id = req.user.id;

    if (!full_name || !email || !address || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check for duplicates
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

// 🧩 Get All Customers
export const getAllCustomer = async (req: AuthRequest, res: Response) => {
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

    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    let query = Customer.query();

    if (req.user.role === "customer") {
      // Customers only see themselves
      query = query.where("auth_id", req.user.id);
    } else if (req.user.role === "shop_admin") {
      // Shop admin → only customers who ordered from their shop
      query = query
        .join("orders", "orders.customer_id", "customer.id")
        .join("cakes", "cakes.id", "orders.cake_id")
        .join("shops", "shops.id", "cakes.shop_id")
        .where("shops.owner_auth_id", req.user.id) // ✅ correct ownership check
        .distinct("customer.*");
    }
    // Super admin → sees all

    // Search
    if (search) {
      query = query.where((builder) => {
        builder
          .where("customer.full_name", "ilike", `%${search}%`)
          .orWhere("customer.email", "ilike", `%${search}%`)
          .orWhere("customer.phone", "ilike", `%${search}%`);
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
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// 🧩 Get Customer by ID
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Customer ID required" });

    const customer = await Customer.query().findById(id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    const user = req.user!;

    // Customer can only access their own data
    if (user.role === "customer" && customer.auth_id !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Shop admin → only if that customer ordered from their shop
    if (user.role === "shop_admin") {
      const order = await Customer.relatedQuery("orders")
        .for(customer.id)
        .join("cakes", "cakes.id", "orders.cake_id")
        .join("shops", "shops.id", "cakes.shop_id")
        .where("shops.owner_auth_id", user.id)
        .first();

      if (!order)
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (err: any) {
    console.error("Error fetching customer:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// 🧩 Update Customer Profile (only by that customer)
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only customers can update their profile",
      });
    }

    const { id } = req.params;
    const { full_name, email, address, phone } = req.body;

    const customer = await Customer.query().findById(id);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    if (customer.auth_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile",
      });
    }

    // Email uniqueness check
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
  } catch (err: any) {
    console.error("Error updating customer:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// 🧩 Update Customer Status (only by shop admin)
export const updateCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== "shop_admin") {
      return res.status(403).json({
        success: false,
        message: "Only shop admins can update status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status)
      return res
        .status(400)
        .json({ success: false, message: "ID and status required" });
    if (!["active", "inactive"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });

    // Ownership check: customer must have ordered from this shop
    const order = await Customer.relatedQuery("orders")
      .for(id)
      .join("cakes", "cakes.id", "orders.cake_id")
      .join("shops", "shops.id", "cakes.shop_id")
      .where("shops.owner_auth_id", user.id)
      .first();

    if (!order)
      return res.status(403).json({
        success: false,
        message: "Forbidden: Customer not in your shop",
      });

    const updatedCustomer = await Customer.query().patchAndFetchById(id, {
      status,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Customer ${
        status === "active" ? "activated" : "deactivated"
      } successfully`,
      data: updatedCustomer,
    });
  } catch (err: any) {
    console.error("Error updating customer status:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
