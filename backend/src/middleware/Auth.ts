import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "shop_admin" | "super_admin";
  };
}

const ensureAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // ✅ Read token from cookies instead of headers
  const token = req.cookies?.token;

  console.log("🍪 Token from cookies:", token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token found" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
      id: string;
      role: "customer" | "shop_admin" | "super_admin";
    };

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default ensureAuthenticated;
