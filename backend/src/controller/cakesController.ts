import { Request, Response } from "express";
import { Cake } from "../models/cake";
import { AuthRequest } from "../middleware/Auth";

// CREATE Cake (shop_admin only)
export const createCake = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    if (role !== "shop_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only shop_admins can create cakes" });
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
      shopId: userId, // ownership
    });

    res.status(201).json({
      success: true,
      message: "Cake created successfully",
      data: newCake,
    });
  } catch (err: any) {
    console.error("Create cake error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ all cakes (anyone can view)
export const getAllCakes = async (_req: Request, res: Response) => {
  try {
    const cakes = await Cake.query();
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

// UPDATE Cake (only owner shop_admin)
export const updateCake = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id: userId } = req.user!;
    console.log("[UPDATE] User info:", req.user);

    if (role !== "shop_admin") {
      console.log("[UPDATE] Forbidden: user is not shop_admin");
      return res
        .status(403)
        .json({ success: false, message: "Only shop_admins can update cakes" });
    }

    const { id } = req.params;
    console.log("[UPDATE] Cake ID to update:", id);

    const cake = await Cake.query().findById(id);
    console.log("[UPDATE] Fetched cake:", cake);

    if (!cake) {
      console.log("[UPDATE] Cake not found");
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    }

    if (cake.shopId !== userId) {
      console.log(
        `[UPDATE] Not authorized: cake.shopId (${cake.shopId}) !== userId (${userId})`
      );
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this cake",
      });
    }

    const updatedCake = await Cake.query().patchAndFetchById(id, req.body);
    console.log("[UPDATE] Updated cake:", updatedCake);

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
