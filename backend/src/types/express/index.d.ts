import "express";

declare module "express" {
  interface Request {
    user?: {
      id: string;
      role: "customer" | "shop_admin" | "super_admin";
    };
  }
}
