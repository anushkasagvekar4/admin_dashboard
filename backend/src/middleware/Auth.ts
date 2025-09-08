import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

const ensureAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  console.log("Incoming cookies:", req.cookies.token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: JWT token required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default ensureAuthenticated;
