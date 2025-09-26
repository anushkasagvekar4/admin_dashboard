import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
  // const token = req.headers.authorization;

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1]; // <-- important!

  // const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  console.log("Incoming cookies:", req.cookies.token);
  console.log("Cookies:", req.cookies);
  console.log("Authorization header:", req.headers.authorization);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: JWT token required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
      id: string;
      role: "customer" | "shop_admin" | "super_admin";
    };
    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default ensureAuthenticated;
