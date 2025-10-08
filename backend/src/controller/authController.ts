import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/auth";

// -------------------- SIGNUP --------------------
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
        message:
          "Invalid role. Must be 'customer', 'shop_admin', or 'super_admin'",
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

    // Insert into auth table
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

    // Set JWT cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- SIGNIN --------------------
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

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

    const isMatch = await bcrypt.compare(password, authUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: authUser.id, role: authUser.role },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    // Set JWT cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Signin successful",
      role: authUser.role,
      email: authUser.email,
    });
  } catch (err: any) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- LOGOUT --------------------
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
