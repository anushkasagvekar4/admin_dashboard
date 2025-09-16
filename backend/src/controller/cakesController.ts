import { Request, Response } from "express";
import knex from "knex";

export const getAllCakes = async (req: Request, res: Response) => {
  try {
    const cakes = await knex("cakes").select("*");
    console.log(cakes);
    res.status(200).json({
      succes: true,
      message: "users fetched successfully",
      data: cakes,
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

export const deleteCake = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: " ID is required" });
      return;
    }

    const deletedCake = await knex("cakes").where({ id }).del().returning("*");

    console.log(deletedCake);

    res.status(200).json({
      succes: true,
      message: "cake deleted successfully",
      data: deletedCake,
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

export const createCake = async (req: Request, res: Response) => {
  try {
    const [newCake] = await knex("cakes").insert(req.body).returning("*");
    res.status(201).json({
      succes: true,
      message: "cake created successfully",
      data: newCake,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const updateCake = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body; // fields to update

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    // Check if any fields are sent
    if (!name && !price && !description) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    // Perform update
    const updated = await knex("cakes")
      .where({ id })
      .update({ name, price, description });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Cake not found" });
    }

    const updatedCake = await knex("cakes").where({ id }).first();

    res.status(200).json({
      success: true,
      message: "Cake updated successfully",
      data: updatedCake,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
