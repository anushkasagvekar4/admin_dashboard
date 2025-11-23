import { Request, Response } from "express";
import knex from "../db/knexInstance";

export const getSuperAdminDashboard = async (req: Request, res: Response) => {
  try {
    // 🧮 Total Sales
    const totalSalesResult = await knex("order_items")
      .sum({ total_sales: knex.raw("price * qty") })
      .first();

    // 🧮 Total Orders
    const totalOrdersResult = await knex("orders")
      .count("id as total_orders")
      .first();

    // 🧮 Active Shops
    const activeShopsResult = await knex("shops")
      .where("status", "active")
      .count("id as active_shops")
      .first();

    // 🧮 Total Customers
    const totalCustomersResult = await knex("auth")
      .where("role", "customer")
      .count("id as total_customers")
      .first();

    // 🏪 Top 3 Shops by Sales
    interface TopShop {
      shopname: string;
      sales: string | null;
    }

    const topShops = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .select("s.shopname")
      .sum({ sales: knex.raw("oi.price * oi.qty") })
      .groupBy("s.shopname")
      .orderBy("sales", "desc")
      .limit(3)
      .then((rows) => rows as TopShop[]);

    // 🍰 Top 3 Cakes by Orders
    interface TopCake {
      cake_name: string;
      total_orders: string | null;
    }

    const topCakes = await knex("cakes as c")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .select("c.cake_name")
      .sum({ total_orders: knex.raw("oi.qty") })
      .groupBy("c.cake_name")
      .orderBy("total_orders", "desc")
      .limit(3)
      .then((rows) => rows as TopCake[]);

    // ✅ Final Response
    res.json({
      totalSales: Number(totalSalesResult?.total_sales ?? 0),
      totalOrders: Number(totalOrdersResult?.total_orders ?? 0),
      activeShops: Number(activeShopsResult?.active_shops ?? 0),
      totalCustomers: Number(totalCustomersResult?.total_customers ?? 0),
      topShops: topShops.map((s) => ({
        name: s.shopname,
        sales: Number(s.sales ?? 0),
      })),
      topCakes: topCakes.map((c) => ({
        name: c.cake_name,
        orders: Number(c.total_orders ?? 0),
      })),
    });
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
