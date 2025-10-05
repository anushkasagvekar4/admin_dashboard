import { Request, Response } from "express";
import { Cake } from "../models/cake";
import { AuthRequest } from "../middleware/Auth";

export const createCake = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    // Ensure only shop_admin can create
    if (!req.user || req.user.role !== "shop_admin") {
      return res.status(403).json({
        success: false,
        message: "Only shop admins can create cakes",
      });
    }

    const {
      image,
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status,
    } = req.body;

    // ✅ use shopId from logged-in user (shop admin)
    const newCake = await Cake.query().insertAndFetch({
      image,
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status: status || "active",
      shopId: req.user.id, // 👈 this comes from Shop Admin's id
    });

    return res.status(201).json({
      success: true,
      message: "Cake created successfully",
      data: newCake,
    });
  } catch (err: any) {
    console.error("Create cake error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const getAllCakes = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    let cakes;

    if (user.role === "shop_admin") {
      // Show all cakes for this shop admin (active + inactive)
      cakes = await Cake.query().where("shopId", user.id);
    } else {
      // Customers or other roles: show all cakes (frontend will mark inactive as unavailable)
      cakes = await Cake.query();
    }

    res.status(200).json({ success: true, data: cakes });
  } catch (err: any) {
    console.error("Get cakes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ single cake
export const getCakeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cake = await Cake.query().findById(id);
    if (!cake) {
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    }
    res.status(200).json({ success: true, data: cake });
  } catch (err: any) {
    console.error("Get cake error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCake = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== "shop_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only shop_admins can update cakes" });
    }

    const { id } = req.params;
    const cake = await Cake.query().findById(id);

    if (!cake)
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    if (cake.shopId !== userId)
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this cake",
      });

    // Prevent editing inactive cakes
    if (cake.status === "inactive") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit inactive cake" });
    }

    const updatedCake = await Cake.query().patchAndFetchById(id, req.body);
    res.status(200).json({
      success: true,
      message: "Cake updated successfully",
      data: updatedCake,
    });
  } catch (err: any) {
    console.error("Update cake error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Cake (only owner shop_admin)
export const deleteCake = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    console.log("[DELETE] User info:", req.user);

    if (role !== "shop_admin") {
      console.log("[DELETE] Forbidden: user is not shop_admin");
      return res
        .status(403)
        .json({ success: false, message: "Only shop_admins can delete cakes" });
    }

    const { id } = req.params;
    console.log("[DELETE] Cake ID to delete:", id);

    const cake = await Cake.query().findById(id);
    console.log("[DELETE] Fetched cake:", cake);

    if (!cake) {
      console.log("[DELETE] Cake not found");
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    }

    if (cake.shopId !== userId) {
      console.log(
        `[DELETE] Not authorized: cake.shopId (${cake.shopId}) !== userId (${userId})`
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this cake",
      });
    }

    await Cake.query().deleteById(id);
    console.log("[DELETE] Cake deleted:", id);

    res
      .status(200)
      .json({ success: true, message: "Cake deleted successfully" });
  } catch (err: any) {
    console.error("Delete cake error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle inactive (soft delete)
export const toggleCakeStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== "shop_admin") {
      return res.status(403).json({
        success: false,
        message: "Only shop_admins can toggle cake status",
      });
    }

    const { id } = req.params;
    const cake = await Cake.query().findById(id);

    if (!cake)
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    if (cake.shopId !== userId)
      return res.status(403).json({
        success: false,
        message: "Not authorized to toggle this cake",
      });

    // Toggle status
    const newStatus = cake.status === "active" ? "inactive" : "active";
    const updatedCake = await Cake.query().patchAndFetchById(id, {
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      message: `Cake status updated to ${newStatus}`,
      data: updatedCake,
    });
  } catch (err: any) {
    console.error("Toggle cake status error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
