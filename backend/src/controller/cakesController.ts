import { Request, Response } from "express";
import { Cake } from "../models/cake";
import { AuthRequest } from "../middleware/Auth";

// ====================== CREATE CAKE ======================
export const createCake = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "shop_admin") {
      return res.status(403).json({
        success: false,
        message: "Only shop admins can create cakes",
      });
    }

    const {
      images,
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status,
    } = req.body;
    console.log(req.body);

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const newCake = await Cake.query().insertAndFetch({
      images, // ✅ multiple image URLs
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status: status || "active",
      shopId: req.user.id,
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

// ====================== GET ALL CAKES ======================
export const getAllCakes = async (req: Request, res: Response) => {
  try {
    const cakes = await Cake.query();

    res.status(200).json({ success: true, data: cakes });
  } catch (err: any) {
    console.error("Get cakes error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ====================== GET SINGLE CAKE ======================
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

// ====================== UPDATE CAKE ======================
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

    if (cake.status === "inactive") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot edit inactive cake" });
    }

    const {
      images, // ✅ multiple image URLs allowed
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status,
    } = req.body;

    const updatedCake = await Cake.query().patchAndFetchById(id, {
      ...(images && Array.isArray(images) ? { images } : {}), // ✅ only update if provided
      cake_name,
      price,
      cake_type,
      flavour,
      category,
      size,
      noofpeople,
      status,
    });

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

// ====================== DELETE CAKE ======================
export const deleteCake = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== "shop_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only shop_admins can delete cakes" });
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
        message: "Not authorized to delete this cake",
      });

    await Cake.query().deleteById(id);
    res
      .status(200)
      .json({ success: true, message: "Cake deleted successfully" });
  } catch (err: any) {
    console.error("Delete cake error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ====================== TOGGLE STATUS ======================
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
