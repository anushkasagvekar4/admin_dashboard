import { Response } from "express";
import { Shop } from "../models/shop";
import { AuthRequest } from "../middleware/Auth";

// Get all approved shops

export const getShops = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only super_admins can view shops" });
    }

    // ✅ Query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "created_at";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // ✅ Build query
    let query = Shop.query();

    // Searching across multiple fields
    if (search) {
      query = query.where((builder) => {
        builder
          .where("shopname", "ilike", `%${search}%`)
          .orWhere("ownername", "ilike", `%${search}%`)
          .orWhere("email", "ilike", `%${search}%`)
          .orWhere("phone", "ilike", `%${search}%`)
          .orWhere("city", "ilike", `%${search}%`);
      });
    }

    const allowedSortOrders: ("asc" | "desc")[] = ["asc", "desc"];
    const safeSortOrder: "asc" | "desc" = allowedSortOrders.includes(
      sortOrder as any
    )
      ? (sortOrder as "asc" | "desc")
      : "desc";

    query = query.orderBy(sortBy, safeSortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      query.clone().limit(limit).offset(offset),
      query.clone().resultSize(),
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Get shops error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get shop by ID
export const getShopById = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can view a shop",
      });
    }

    const { id } = req.params;
    const shop = await Shop.query().findById(id);

    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({ success: true, data: shop });
  } catch (err: any) {
    console.error("Get shop by id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update shop (super_admin only)
export const updateShop = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can update shops",
      });
    }

    const { id } = req.params;
    const updatedShop = await Shop.query().patchAndFetchById(id, req.body);

    if (!updatedShop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: updatedShop,
    });
  } catch (err: any) {
    console.error("Update shop error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Toggle shop status (active <-> inactive)
export const toggleShopStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can update shop status",
      });
    }

    const { id } = req.params;
    const shop = await Shop.query().findById(id);

    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    const newStatus = shop.status === "active" ? "inactive" : "active";

    const updatedShop = await Shop.query().patchAndFetchById(id, {
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      message: `Shop ${
        newStatus === "active" ? "activated" : "deactivated"
      } successfully`,
      data: updatedShop,
    });
  } catch (err: any) {
    console.error("Toggle shop status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
