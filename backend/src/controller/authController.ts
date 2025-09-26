import { Request, Response } from "express";
import knex from "../db/knexInstance";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/auth";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    // Validate role
    const allowedRoles = ["customer", "shop_admin", "super_admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'customer' or 'shop_admin'",
      });
    }

    // Check if user already exists
    const existingUser = await Auth.query().findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into auth table (Objection will map this)
    const newUser = await Auth.query().insertAndFetch({
      email,
      password: hashedPassword,
      role,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "Signup successful",
      role: newUser.role,
      token,
      email: newUser.email,
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const authUser = await Auth.query().findOne({ email });

    if (!authUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, authUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Determine role
    const role = authUser.role; // should be 'super_admin', 'shop_admin', or 'user'

    // JWT payload
    const token = jwt.sign(
      { id: authUser.id, role },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 3600000),
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Signin successful!",
      role,
      token,
    });
  } catch (err: any) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: err.message });
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
    res
      .status(500)
      .json({ success: false, message: "Server error while logging out" });
  }
};
