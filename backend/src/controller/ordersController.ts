import { Request, Response } from "express";
import knex from "knex";

export const getAllorders = async (req: Request, res: Response) => {
  try {
    const orders = await knex("orders").select("*");
    console.log(orders);
    res.status(200).json({
      succes: true,
      message: " All orders fetched successfully",
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    res.status(400).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};

// export const getOrderById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const order = await knex("orders").where({ id }).first();
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: " ID is required" });
      return;
    }

    const deleteUser = await knex("users").where({ id }).del();

    console.log(deleteUser);

    res.status(200).json({
      succes: true,
      message: "users deleted successfully",
      data: deleteUser,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    res.status(400).json({
      success: false,
      message: "server error",
      error: error,
    });
  }
};

// export const createUser = async (req: Request, res: Response) => {
//   try {
//     const [newUser] = await knex("users").insert(req.body).returning("*");
//     res.status(201).json(newUser);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
