import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/auth";
import { Enquiry } from "../models/enquiry";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../services/emailService";
import { ResetToken } from "../models/resetToken";

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
// -------------------- SIGNIN --------------------
export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // 🧩 Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // 🧩 Find user
    const authUser = await Auth.query().findOne({ email });
    if (!authUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 🧩 Compare password
    const isMatch = await bcrypt.compare(password, authUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 🧩 Check enquiry only if role is "shop_admin"
    let enquiryStatus = "none";
    if (authUser.role === "shop_admin") {
      const enquiry = await Enquiry.query()
        .where("email", email)
        .orderBy("created_at", "desc")
        .first();

      if (enquiry) {
        enquiryStatus = enquiry.status;
      }
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: authUser.id, role: authUser.role },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    // ✅ Respond with success and enquiry status
    res.status(200).json({
      success: true,
      message: "Signin successful",
      role: authUser.role,
      email: authUser.email,
      enquiryStatus,
    });
  } catch (err: any) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- LOGOUT --------------------
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err: any) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // 1️⃣ Find user
    const user = await Auth.query().findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2️⃣ Generate a secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3️⃣ Remove old tokens for this email
    await ResetToken.query().delete().where("email", email);

    // 4️⃣ Insert new token
    await ResetToken.query().insert({
      email,
      token: hashedToken,
      expires_at: expiresAt,
    });

    // 5️⃣ Create reset link
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}?email=${email}`;

    // 6️⃣ Send email
    await sendResetPasswordEmail(email, resetUrl);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // 1️⃣ Hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2️⃣ Find valid token
    const tokenEntry = await ResetToken.query()
      .findOne({ email, token: hashedToken })
      .where("expires_at", ">", new Date());

    if (!tokenEntry) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // 3️⃣ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4️⃣ Update password in Auth table
    await Auth.query()
      .patch({ password: hashedPassword })
      .where("email", email);

    // 5️⃣ Delete the used token
    await ResetToken.query().delete().where("email", email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
