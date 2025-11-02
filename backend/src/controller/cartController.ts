// cartController.ts
import { Request, Response } from "express";
import { Cart } from "../models/cart";
import { Cake } from "../models/cake";
import { AuthRequest } from "../middleware/Auth";

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id;
    const cart = await Cart.query()
      .where("userId", userId)
      .withGraphFetched("cake");
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const userId = req.user.id;
    const { cakeId, quantity } = req.body;

    if (!cakeId || !quantity)
      return res
        .status(400)
        .json({ success: false, message: "cakeId and quantity are required" });

    const cake = await Cake.query().findById(cakeId);
    if (!cake)
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });

    const existing = await Cart.query().findOne({ userId, cakeId });

    const cartItem = existing
      ? await existing
          .$query()
          .patchAndFetch({ quantity: existing.quantity + quantity })
      : await Cart.query().insertAndFetch({
          userId,
          cakeId,
          quantity,
          price: cake.price,
        });

    const result = await Cart.query()
      .findById(cartItem.id)
      .withGraphFetched("cake");

    res.json({ success: true, data: result });
  } catch (error: any) {
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
    res.status(500).json({ message: error.message });
  }
};
