import { Request, Response } from "express";
import knex from "../db/knexInstance";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const result = await knex.raw(
      `SELECT * FROM "auth" WHERE "email" = ? LIMIT 1`,
      [email]
    );

    const newUser = result.rows[0];
    console.log("User from DB:", newUser);
    console.log("Password entered:", password);

    if (!newUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!newUser || newUser.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: newUser.id, isAdmin: newUser.is_admin },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 3600000),
      secure: false,
      sameSite: "lax",
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Signin successful!",
      isAdmin: newUser.isAdmin,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error while logging out" });
  }
};
