import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "shop_admin" | "super_admin";
    shopId?: string;
  };
}

// Use the normal Request type; your global augmentation adds `user` automatically
const ensureAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // ✅ Read token from cookies first, then fallback to Authorization header
  let token = req.cookies?.token;
  
  // If no token in cookies, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token found" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
      id: string;
      role: "customer" | "shop_admin" | "super_admin";
    };

    // Attach user to request (now valid because of global type)
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
