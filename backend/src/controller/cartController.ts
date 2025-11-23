import { Request, Response } from "express";
import { Cart } from "../models/cart";
import { Cake } from "../models/cake";
import { Customer } from "../models/customer";
import { AuthRequest } from "../middleware/Auth";

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    console.log("REQ USER:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authId = req.user.id;

    // Find customer record using auth ID
    const customer = await Customer.query().findOne({ auth_id: authId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customerId = customer.id;

    const cart = await Cart.query()
      .where("customerId", customerId)
      .withGraphFetched("cake");

    res.json(cart);
  } catch (error: any) {
    console.error("❌ getCart error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const authId = req.user.id;
    const { cakeId, quantity, price } = req.body;

    if (!cakeId || !quantity || !price)
      return res
        .status(400)
        .json({ success: false, message: "cakeId, quantity, and price are required" });

    // Find customer record using auth ID
    const customer = await Customer.query().findOne({ auth_id: authId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const customerId = customer.id;

    const cake = await Cake.query().findById(cakeId);
    if (!cake)
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });

    // 🔍 Check if item exists
    const existing = await Cart.query().findOne({ customerId, cakeId });

    const cartItem = existing
      ? await existing
          .$query()
          .patchAndFetch({ quantity: existing.quantity + quantity, price })
      : await Cart.query().insertAndFetch({
          customerId,
          cakeId,
          quantity,
          price,
        });

    const result = await Cart.query()
      .findById(cartItem.id)
      .withGraphFetched("cake");

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ addToCart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const updated = await Cart.query()
      .findById(id)
      .patch({ quantity })
      .returning("*")
      .first();

    if (!updated) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const result = await Cart.query().findById(id).withGraphFetched("cake");
    res.json(result);
  } catch (error: any) {
    console.error("❌ updateCartItem error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Cart.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed" });
  } catch (error: any) {
    console.error("❌ removeCartItem error:", error);
    res.status(500).json({ message: error.message });
  }
};
