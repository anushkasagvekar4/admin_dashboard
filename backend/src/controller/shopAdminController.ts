import { Request, Response } from "express";
import knex from "../db/knexInstance";
import { AuthRequest } from "../middleware/Auth";

// 📊 Get Shop Admin Dashboard Analytics
export const getShopAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Basic stats
    const [totalRevenue, totalOrders, activeCakes, totalCustomers] = await Promise.all([
      knex("order_items as oi")
        .join("orders as o", "oi.order_id", "o.id")
        .join("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("o.created_at", ">=", startDate)
        .sum({ total: knex.raw("oi.price * oi.qty") })
        .first(),
      
      knex("orders as o")
        .join("order_items as oi", "o.id", "oi.order_id")
        .join("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("o.created_at", ">=", startDate)
        .countDistinct({ total: "o.id" })
        .first(),
      
      knex("cakes")
        .where("shopId", shopId)
        .where("available", true)
        .count({ total: "id" })
        .first(),
      
      knex("orders as o")
        .join("order_items as oi", "o.id", "oi.order_id")
        .join("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .countDistinct({ total: "o.customer_id" })
        .first(),
    ]);

    // Recent orders
    const recentOrders = await knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .where("cake.shopId", shopId)
      .select(
        "o.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        knex.raw("SUM(oi.price * oi.qty) as order_total")
      )
      .groupBy("o.id", "c.full_name", "c.email")
      .orderBy("o.created_at", "desc")
      .limit(5);

    // Top selling cakes
    const topCakes = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.cake_name",
        "c.images",
        "c.price"
      )
      .sum({ totalSold: "oi.qty" })
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.images", "c.price")
      .orderBy("revenue", "desc")
      .limit(5);

    // Revenue trends
    const revenueTrends = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(knex.raw("DATE(o.created_at) as date"))
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ orders: "o.id" })
      .groupBy(knex.raw("DATE(o.created_at)"))
      .orderBy("date", "asc");

    res.json({
      success: true,
      message: "Shop admin dashboard fetched successfully",
      data: {
        stats: {
          totalRevenue: Number(totalRevenue?.total || 0),
          totalOrders: Number(totalOrders?.total || 0),
          activeCakes: Number(activeCakes?.total || 0),
          totalCustomers: Number(totalCustomers?.total || 0),
        },
        recentOrders: recentOrders.map((order: any) => ({
          ...order,
          orderTotal: Number(order.order_total || 0),
        })),
        topCakes: topCakes.map((cake: any) => ({
          ...cake,
          totalSold: Number(cake.totalSold || 0),
          revenue: Number(cake.revenue || 0),
          image: (cake as any).images ? (typeof (cake as any).images === 'string' ? JSON.parse((cake as any).images) : (cake as any).images)[0] : null,
        })),
        revenueTrends: revenueTrends.map((trend: any) => ({
          date: trend.date,
          revenue: Number(trend.revenue || 0),
          orders: Number(trend.orders || 0),
        })),
      },
    });
  } catch (error: any) {
    console.error("Shop Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop admin dashboard",
      error: error.message,
    });
  }
};

// 📦 Get Shop Orders with Advanced Filtering
export const getShopOrders = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const {
      page = '1',
      limit = '10',
      status,
      trackingStatus,
      customerId,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .where("cake.shopId", shopId)
      .select(
        "o.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "c.phone as customer_phone",
        "c.address as customer_address",
        knex.raw("SUM(oi.price * oi.qty) as order_total")
      )
      .groupBy("o.id", "c.full_name", "c.email", "c.phone", "c.address");

    // Apply filters
    if (status) {
      query = query.where("o.status", status);
    }
    
    if (trackingStatus) {
      query = query.where("o.tracking_status", trackingStatus);
    }
    
    if (customerId) {
      query = query.where("o.customer_id", customerId);
    }
    
    if (dateFrom) {
      query = query.where("o.created_at", ">=", dateFrom);
    }
    
    if (dateTo) {
      query = query.where("o.created_at", "<=", dateTo);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("o.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const orders = await query
      .orderBy(`o.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const items = await knex("order_items as oi")
          .leftJoin("cakes as c", "oi.cake_id", "c.id")
          .where("oi.order_id", order.id)
          .select(
            "oi.*",
            "c.cake_name",
            "c.images"
          );

        return {
          ...order,
          items: items.map((item: any) => ({
            ...item,
            image: (item as any).images ? (typeof (item as any).images === 'string' ? JSON.parse((item as any).images) : (item as any).images)[0] : null,
            total: Number(item.price || 0) * Number(item.qty || 0),
          })),
          orderTotal: Number(order.order_total || 0),
        };
      })
    );

    res.json({
      success: true,
      message: "Shop orders fetched successfully",
      data: {
        orders: ordersWithItems,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error: any) {
    console.error("Shop Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop orders",
      error: error.message,
    });
  }
};

// 🔄 Update Order Status (Shop Admin)
export const updateShopOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { id } = req.params;
    const { trackingStatus, adminNote } = req.body;

    // Verify order belongs to this shop
    const orderCheck = await knex("orders as o")
      .join("order_items as oi", "o.id", "oi.order_id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("o.id", id)
      .where("c.shopId", shopId)
      .first();

    if (!orderCheck) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to your shop",
      });
    }

    // Update order tracking status
    const updateData: any = {
      tracking_status: trackingStatus,
      updated_at: new Date().toISOString(),
    };

    await knex("orders").where("id", id).update(updateData);

    // Log admin action
    if (adminNote) {
      await knex("order_admin_notes").insert({
        order_id: id,
        admin_id: req.user?.id,
        note: adminNote,
        created_at: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: {
        id,
        trackingStatus,
        updatedAt: updateData.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Update Shop Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// 📋 Get Order Details (Shop Admin)
export const getShopOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { id } = req.params;

    // Get order with customer info and verify shop ownership
    const order = await knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .where("o.id", id)
      .where("cake.shopId", shopId)
      .select(
        "o.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "c.phone as customer_phone",
        "c.address as customer_address"
      )
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to your shop",
      });
    }

    // Get order items
    const items = await knex("order_items as oi")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("oi.order_id", id)
      .select(
        "oi.*",
        "c.cake_name",
        "c.images",
        "c.description"
      );

    // Get admin notes
    const adminNotes = await knex("order_admin_notes")
      .leftJoin("auth", "order_admin_notes.admin_id", "auth.id")
      .where("order_admin_notes.order_id", id)
      .select(
        "order_admin_notes.*",
        "auth.email as admin_email"
      )
      .orderBy("order_admin_notes.created_at", "desc");

    res.json({
      success: true,
      message: "Order details fetched successfully",
      data: {
        order: {
          ...order,
          items: items.map((item: any) => ({
            ...item,
            image: (item as any).images ? (typeof (item as any).images === 'string' ? JSON.parse((item as any).images) : (item as any).images)[0] : null,
            total: Number(item.price || 0) * Number(item.qty || 0),
          })),
          orderTotal: items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0),
        },
        adminNotes,
      },
    });
  } catch (error: any) {
    console.error("Shop Order Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// 📊 Get Shop Analytics
export const getShopAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Sales trends
    const salesTrends = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(knex.raw("DATE(o.created_at) as date"))
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ orders: "o.id" })
      .groupBy(knex.raw("DATE(o.created_at)"))
      .orderBy("date", "asc");

    // Top products
    const topProducts = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.cake_name",
        "c.images",
        "c.price"
      )
      .sum({ totalSold: "oi.qty" })
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.images", "c.price")
      .orderBy("revenue", "desc")
      .limit(10);

    // Customer analytics
    const customerAnalytics = await knex("orders as o")
      .join("customers as c", "o.customer_id", "c.id")
      .join("order_items as oi", "o.id", "oi.order_id")
      .join("cakes as cake", "oi.cake_id", "cake.id")
      .where("cake.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.full_name",
        "c.email"
      )
      .countDistinct({ orderCount: "o.id" })
      .sum({ totalSpent: knex.raw("oi.price * oi.qty") })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.full_name", "c.email")
      .orderBy("totalSpent", "desc")
      .limit(10);

    // Order status breakdown
    const orderStatusBreakdown = await knex("orders as o")
      .join("order_items as oi", "o.id", "oi.order_id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select("o.status", "o.tracking_status")
      .count("o.id as count")
      .groupBy("o.status", "o.tracking_status");

    res.json({
      success: true,
      message: "Shop analytics fetched successfully",
      data: {
        salesTrends: salesTrends.map((trend: any) => ({
          date: trend.date,
          revenue: Number(trend.revenue || 0),
          orders: Number(trend.orders || 0),
        })),
        topProducts: topProducts.map((product: any) => ({
          ...product,
          totalSold: Number(product.totalSold || 0),
          revenue: Number(product.revenue || 0),
          image: (product as any).images ? (typeof (product as any).images === 'string' ? JSON.parse((product as any).images) : (product as any).images)[0] : null,
        })),
        customerAnalytics: customerAnalytics.map((customer: any) => ({
          ...customer,
          totalSpent: Number(customer.totalSpent || 0),
          orderCount: Number(customer.orderCount || 0),
          avgOrderValue: Number(customer.avgOrderValue || 0),
        })),
        orderStatusBreakdown: orderStatusBreakdown.map((status: any) => ({
          status: status.status,
          trackingStatus: status.tracking_status,
          count: Number(status.count),
        })),
      },
    });
  } catch (error: any) {
    console.error("Shop Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop analytics",
      error: error.message,
    });
  }
};

// Helper function to get start date based on period
function getStartDate(period: string): string {
  const now = new Date();
  switch (period) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// ⭐ Get Shop Reviews
export const getShopReviews = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const {
      page = '1',
      limit = '10',
      rating,
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("reviews as r")
      .leftJoin("customers as c", "r.customer_id", "c.id")
      .leftJoin("cakes as cake", "r.cake_id", "cake.id")
      .where("cake.shop_id", shopId)
      .select(
        "r.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "cake.cake_name"
      );

    // Apply filters
    if (rating) {
      query = query.where("r.rating", rating);
    }
    
    if (status !== 'all') {
      if (status === 'responded') {
        query = query.whereNotNull("r.shop_response");
      } else if (status === 'unresponded') {
        query = query.whereNull("r.shop_response");
      }
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("r.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const reviews = await query
      .orderBy(`r.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get review statistics
    const [avgRating, ratingDistribution, totalReviews] = await Promise.all([
      knex("reviews as r")
        .leftJoin("cakes as c", "r.cake_id", "c.id")
        .where("c.shop_id", shopId)
        .avg({ avgRating: "r.rating" })
        .first(),
      
      knex("reviews as r")
        .leftJoin("cakes as c", "r.cake_id", "c.id")
        .where("c.shop_id", shopId)
        .select("r.rating")
        .count("r.id as count")
        .groupBy("r.rating")
        .orderBy("r.rating", "desc"),
      
      knex("reviews as r")
        .leftJoin("cakes as c", "r.cake_id", "c.id")
        .where("c.shop_id", shopId)
        .count({ total: "r.id" })
        .first(),
    ]);

    res.json({
      success: true,
      message: "Shop reviews fetched successfully",
      data: {
        reviews: reviews.map((review: any) => ({
          ...review,
          responded: !!review.shop_response,
        })),
        statistics: {
          totalReviews: Number(totalReviews?.total || 0),
          avgRating: Number(avgRating?.avgRating || 0).toFixed(1),
          ratingDistribution: ratingDistribution.map((dist: any) => ({
            rating: dist.rating,
            count: Number(dist.count),
          })),
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error: any) {
    console.error("Get Shop Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop reviews",
      error: error.message,
    });
  }
};

// 💬 Respond to Review
export const respondToReview = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { id } = req.params;
    const { response } = req.body;

    // Verify review belongs to this shop
    const reviewCheck = await knex("reviews as r")
      .leftJoin("cakes as c", "r.cake_id", "c.id")
      .where("r.id", id)
      .where("c.shop_id", shopId)
      .first();

    if (!reviewCheck) {
      return res.status(404).json({
        success: false,
        message: "Review not found or does not belong to your shop",
      });
    }

    // Update review with shop response
    await knex("reviews")
      .where("id", id)
      .update({
        shop_response: response,
        shop_responded_at: new Date().toISOString(),
        shop_responded_by: req.user?.id,
      });

    res.json({
      success: true,
      message: "Review response submitted successfully",
      data: {
        id,
        response,
        respondedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Respond to Review Error:", error);
    res.status(500).json({
      success: false,
      message: "Error responding to review",
      error: error.message,
    });
  }
};

// 📊 Get Review Analytics
export const getReviewAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Review trends over time
    const reviewTrends = await knex("reviews as r")
      .leftJoin("cakes as c", "r.cake_id", "c.id")
      .where("c.shop_id", shopId)
      .where("r.created_at", ">=", startDate)
      .select(knex.raw("DATE(r.created_at) as date"))
      .avg({ avgRating: "r.rating" })
      .count("r.id as reviewCount")
      .groupBy(knex.raw("DATE(r.created_at)"))
      .orderBy("date", "asc");

    // Most reviewed products
    const mostReviewedProducts = await knex("reviews as r")
      .leftJoin("cakes as c", "r.cake_id", "c.id")
      .where("c.shop_id", shopId)
      .select(
        "c.id",
        "c.cake_name",
        "c.images"
      )
      .avg({ avgRating: "r.rating" })
      .count("r.id as reviewCount")
      .groupBy("c.id", "c.cake_name", "c.images")
      .orderBy("reviewCount", "desc")
      .limit(10);

    // Response rate
    const [totalReviews, respondedReviews] = await Promise.all([
      knex("reviews as r")
        .leftJoin("cakes as c", "r.cake_id", "c.id")
        .where("c.shop_id", shopId)
        .count({ total: "r.id" })
        .first(),
      
      knex("reviews as r")
        .leftJoin("cakes as c", "r.cake_id", "c.id")
        .where("c.shop_id", shopId)
        .whereNotNull("r.shop_response")
        .count({ responded: "r.id" })
        .first(),
    ]);

    const responseRate = Number(totalReviews?.total || 0) > 0 
      ? (Number(respondedReviews?.responded || 0) / Number(totalReviews?.total || 0)) * 100 
      : 0;

    res.json({
      success: true,
      message: "Review analytics fetched successfully",
      data: {
        reviewTrends: reviewTrends.map((trend: any) => ({
          date: trend.date,
          avgRating: Number(trend.avgRating || 0).toFixed(1),
          reviewCount: Number(trend.reviewCount || 0),
        })),
        mostReviewedProducts: mostReviewedProducts.map((product: any) => ({
          ...product,
          avgRating: Number(product.avgRating || 0).toFixed(1),
          reviewCount: Number(product.reviewCount || 0),
          image: (product as any).images ? (typeof (product as any).images === 'string' ? JSON.parse((product as any).images) : (product as any).images)[0] : null,
        })),
        responseRate: Number(responseRate).toFixed(1),
        totalReviews: Number(totalReviews?.total || 0),
        respondedReviews: Number(respondedReviews?.responded || 0),
      },
    });
  } catch (error: any) {
    console.error("Review Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching review analytics",
      error: error.message,
    });
  }
};

// 📦 Get Shop Inventory
export const getShopInventory = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const {
      page = '1',
      limit = '10',
      category,
      stockStatus = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("cakes as c")
      .where("c.shopId", shopId)
      .select(
        "c.*",
        knex.raw("COALESCE(SUM(oi.qty), 0) as total_sold")
      )
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.status", "!=", "Cancelled")
      .groupBy("c.id");

    // Apply filters
    if (category) {
      query = query.where("c.category", category);
    }
    
    if (stockStatus !== 'all') {
      if (stockStatus === 'low') {
        query = query.where("c.stock_quantity", "<=", knex.raw("c.low_stock_threshold"));
      } else if (stockStatus === 'out') {
        query = query.where("c.stock_quantity", "=", 0);
      } else if (stockStatus === 'available') {
        query = query.where("c.stock_quantity", ">", 0);
      }
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("c.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const inventory = await query
      .orderBy(`c.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get inventory statistics
    const [totalProducts, lowStockProducts, outOfStockProducts, totalValue] = await Promise.all([
      knex("cakes")
        .where("shopId", shopId)
        .count({ total: "id" })
        .first(),
      
      knex("cakes")
        .where("shopId", shopId)
        .where("stock_quantity", "<=", knex.raw("low_stock_threshold"))
        .where("stock_quantity", ">", 0)
        .count({ total: "id" })
        .first(),
      
      knex("cakes")
        .where("shopId", shopId)
        .where("stock_quantity", "=", 0)
        .count({ total: "id" })
        .first(),
      
      knex("cakes")
        .where("shopId", shopId)
        .sum({ totalValue: knex.raw("stock_quantity * price") })
        .first(),
    ]);

    // Get low stock alerts
    const lowStockAlerts = await knex("cakes")
      .where("shopId", shopId)
      .where("stock_quantity", "<=", knex.raw("low_stock_threshold"))
      .where("stock_quantity", ">", 0)
      .select(
        "id",
        "cake_name",
        "stock_quantity",
        "low_stock_threshold",
        "price"
      )
      .orderBy("stock_quantity", "asc")
      .limit(10);

    res.json({
      success: true,
      message: "Shop inventory fetched successfully",
      data: {
        inventory: inventory.map((item: any) => ({
          ...item,
          totalSold: Number(item.total_sold || 0),
          stockValue: Number(item.stock_quantity || 0) * Number(item.price || 0),
          isLowStock: Number(item.stock_quantity || 0) <= Number(item.low_stock_threshold || 0),
          isOutOfStock: Number(item.stock_quantity || 0) === 0,
          image: (item as any).images ? (typeof (item as any).images === 'string' ? JSON.parse((item as any).images) : (item as any).images)[0] : null,
        })),
        statistics: {
          totalProducts: Number(totalProducts?.total || 0),
          lowStockProducts: Number(lowStockProducts?.total || 0),
          outOfStockProducts: Number(outOfStockProducts?.total || 0),
          totalValue: Number(totalValue?.totalValue || 0),
        },
        lowStockAlerts: lowStockAlerts.map((alert: any) => ({
          ...alert,
          stockQuantity: Number(alert.stock_quantity || 0),
          lowStockThreshold: Number(alert.low_stock_threshold || 0),
          price: Number(alert.price || 0),
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error: any) {
    console.error("Get Shop Inventory Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop inventory",
      error: error.message,
    });
  }
};

// 🔄 Update Inventory Stock
export const updateInventoryStock = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { id } = req.params;
    const { stockQuantity, lowStockThreshold } = req.body;

    // Verify cake belongs to this shop
    const cakeCheck = await knex("cakes")
      .where("id", id)
      .where("shopId", shopId)
      .first();

    if (!cakeCheck) {
      return res.status(404).json({
        success: false,
        message: "Product not found or does not belong to your shop",
      });
    }

    // Update stock information
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (stockQuantity !== undefined) {
      updateData.stock_quantity = stockQuantity;
    }

    if (lowStockThreshold !== undefined) {
      updateData.low_stock_threshold = lowStockThreshold;
    }

    await knex("cakes")
      .where("id", id)
      .update(updateData);

    // Log inventory change
    await knex("inventory_logs").insert({
      cake_id: id,
      shop_id: shopId,
      admin_id: req.user?.id,
      action: stockQuantity !== undefined ? 'stock_update' : 'threshold_update',
      old_value: stockQuantity !== undefined ? cakeCheck.stock_quantity : cakeCheck.low_stock_threshold,
      new_value: stockQuantity !== undefined ? stockQuantity : lowStockThreshold,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Inventory updated successfully",
      data: {
        id,
        ...updateData,
      },
    });
  } catch (error: any) {
    console.error("Update Inventory Stock Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating inventory",
      error: error.message,
    });
  }
};

// 📊 Get Inventory Analytics
export const getInventoryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Stock movement trends
    const stockMovement = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .where("o.status", "!=", "Cancelled")
      .select(knex.raw("DATE(o.created_at) as date"))
      .sum({ quantitySold: "oi.qty" })
      .groupBy(knex.raw("DATE(o.created_at)"))
      .orderBy("date", "asc");

    // Top selling products (by quantity)
    const topSellingProducts = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .where("o.status", "!=", "Cancelled")
      .select(
        "c.id",
        "c.cake_name",
        "c.images",
        "c.stock_quantity",
        "c.price"
      )
      .sum({ totalSold: "oi.qty" })
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.images", "c.stock_quantity", "c.price")
      .orderBy("totalSold", "desc")
      .limit(10);

    // Inventory value by category
    const valueByCategory = await knex("cakes")
      .where("shopId", shopId)
      .select("category")
      .sum({ totalValue: knex.raw("stock_quantity * price") })
      .count({ productCount: "id" })
      .groupBy("category")
      .orderBy("totalValue", "desc");

    // Stock efficiency (sold vs available)
    const stockEfficiency = await knex("cakes as c")
      .where("c.shopId", shopId)
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.status", "!=", "Cancelled")
      .select(
        knex.raw("SUM(c.stock_quantity * c.price) as total_available_value"),
        knex.raw("SUM(oi.qty * oi.price) as total_sold_value")
      )
      .first();

    const efficiencyRate = Number(stockEfficiency?.total_available_value || 0) > 0
      ? (Number(stockEfficiency?.total_sold_value || 0) / Number(stockEfficiency?.total_available_value || 0)) * 100
      : 0;

    res.json({
      success: true,
      message: "Inventory analytics fetched successfully",
      data: {
        stockMovement: stockMovement.map((movement: any) => ({
          date: movement.date,
          quantitySold: Number(movement.quantity_sold || 0),
        })),
        topSellingProducts: topSellingProducts.map((product: any) => ({
          ...product,
          totalSold: Number(product.total_sold || 0),
          revenue: Number(product.revenue || 0),
          stockQuantity: Number(product.stock_quantity || 0),
          price: Number(product.price || 0),
          image: (product as any).images ? (typeof (product as any).images === 'string' ? JSON.parse((product as any).images) : (product as any).images)[0] : null,
        })),
        valueByCategory: valueByCategory.map((category: any) => ({
          category: category.category,
          totalValue: Number(category.total_value || 0),
          productCount: Number(category.product_count || 0),
        })),
        stockEfficiency: {
          totalAvailableValue: Number(stockEfficiency?.total_available_value || 0),
          totalSoldValue: Number(stockEfficiency?.total_sold_value || 0),
          efficiencyRate: Number(efficiencyRate).toFixed(1),
        },
      },
    });
  } catch (error: any) {
    console.error("Inventory Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory analytics",
      error: error.message,
    });
  }
};

// 🚚 Get Shop Deliveries
export const getShopDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const {
      page = '1',
      limit = '10',
      status,
      deliveryDate,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("deliveries as d")
      .leftJoin("orders as o", "d.order_id", "o.id")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .where("cake.shopId", shopId)
      .select(
        "d.*",
        "o.order_no",
        "o.status as order_status",
        "c.full_name as customer_name",
        "c.phone as customer_phone",
        "c.address as delivery_address",
        knex.raw("GROUP_CONCAT(cake.cake_name) as items")
      )
      .groupBy("d.id", "o.order_no", "o.status", "c.full_name", "c.phone", "c.address");

    // Apply filters
    if (status) {
      query = query.where("d.status", status);
    }
    
    if (deliveryDate) {
      query = query.where("d.scheduled_date", deliveryDate);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("d.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const deliveries = await query
      .orderBy(`d.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get delivery statistics
    const [totalDeliveries, pendingDeliveries, inTransitDeliveries, completedDeliveries] = await Promise.all([
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .count({ total: "d.id" })
        .first(),
      
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("d.status", "pending")
        .count({ total: "d.id" })
        .first(),
      
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("d.status", "in_transit")
        .count({ total: "d.id" })
        .first(),
      
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("d.status", "delivered")
        .count({ total: "d.id" })
        .first(),
    ]);

    res.json({
      success: true,
      message: "Shop deliveries fetched successfully",
      data: {
        deliveries: deliveries.map((delivery: any) => ({
          ...delivery,
          items: delivery.items ? delivery.items.split(',') : [],
        })),
        statistics: {
          totalDeliveries: Number(totalDeliveries?.total || 0),
          pendingDeliveries: Number(pendingDeliveries?.total || 0),
          inTransitDeliveries: Number(inTransitDeliveries?.total || 0),
          completedDeliveries: Number(completedDeliveries?.total || 0),
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error: any) {
    console.error("Get Shop Deliveries Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop deliveries",
      error: error.message,
    });
  }
};

// 📅 Schedule Delivery
export const scheduleDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { orderId, scheduledDate, deliveryAddress, deliveryInstructions } = req.body;

    // Verify order belongs to this shop
    const orderCheck = await knex("orders as o")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("o.id", orderId)
      .where("c.shopId", shopId)
      .first();

    if (!orderCheck) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to your shop",
      });
    }

    // Check if delivery already exists
    const existingDelivery = await knex("deliveries")
      .where("order_id", orderId)
      .first();

    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery already scheduled for this order",
      });
    }

    // Create delivery
    const delivery = await knex("deliveries").insert({
      order_id: orderId,
      shop_id: shopId,
      scheduled_date: scheduledDate,
      delivery_address: deliveryAddress,
      delivery_instructions: deliveryInstructions,
      status: 'pending',
      created_at: new Date().toISOString(),
    }).returning('*');

    // Update order tracking status
    await knex("orders")
      .where("id", orderId)
      .update({
        tracking_status: 'Processing',
        updated_at: new Date().toISOString(),
      });

    res.json({
      success: true,
      message: "Delivery scheduled successfully",
      data: delivery[0],
    });
  } catch (error: any) {
    console.error("Schedule Delivery Error:", error);
    res.status(500).json({
      success: false,
      message: "Error scheduling delivery",
      error: error.message,
    });
  }
};

// 🔄 Update Delivery Status
export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { id } = req.params;
    const { status, trackingNumber, estimatedDeliveryTime } = req.body;

    // Verify delivery belongs to this shop
    const deliveryCheck = await knex("deliveries as d")
      .leftJoin("orders as o", "d.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("d.id", id)
      .where("c.shopId", shopId)
      .first();

    if (!deliveryCheck) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found or does not belong to your shop",
      });
    }

    // Update delivery
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    if (estimatedDeliveryTime) {
      updateData.estimated_delivery_time = estimatedDeliveryTime;
    }

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    await knex("deliveries")
      .where("id", id)
      .update(updateData);

    // Update order tracking status based on delivery status
    const orderStatusMap: { [key: string]: string } = {
      'pending': 'Processing',
      'confirmed': 'Processing',
      'picked_up': 'Shipped',
      'in_transit': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };

    await knex("orders")
      .where("id", deliveryCheck.order_id)
      .update({
        tracking_status: orderStatusMap[status] || 'Processing',
        updated_at: new Date().toISOString(),
      });

    res.json({
      success: true,
      message: "Delivery status updated successfully",
      data: {
        id,
        status,
        updatedAt: updateData.updated_at,
      },
    });
  } catch (error: any) {
    console.error("Update Delivery Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery status",
      error: error.message,
    });
  }
};

// 📊 Get Delivery Analytics
export const getDeliveryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Delivery trends over time
    const deliveryTrends = await knex("deliveries as d")
      .leftJoin("orders as o", "d.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("d.created_at", ">=", startDate)
      .select(knex.raw("DATE(d.created_at) as date"))
      .count("d.id as deliveryCount")
      .groupBy(knex.raw("DATE(d.created_at)"))
      .orderBy("date", "asc");

    // Delivery performance metrics
    const [onTimeDeliveries, averageDeliveryTime, deliveryByStatus] = await Promise.all([
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("d.status", "delivered")
        .where("d.delivered_at", "<=", knex.raw("d.estimated_delivery_time"))
        .count({ onTime: "d.id" })
        .first(),
      
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("d.status", "delivered")
        .avg({ avgTime: knex.raw("TIMESTAMPDIFF(HOUR, d.created_at, d.delivered_at)") })
        .first(),
      
      knex("deliveries as d")
        .leftJoin("orders as o", "d.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .select("d.status")
        .count("d.id as count")
        .groupBy("d.status"),
    ]);

    // Total deliveries for on-time calculation
    const totalDeliveries = await knex("deliveries as d")
      .leftJoin("orders as o", "d.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("d.status", "delivered")
      .count({ total: "d.id" })
      .first();

    const onTimeRate = Number(totalDeliveries?.total || 0) > 0
      ? (Number(onTimeDeliveries?.onTime || 0) / Number(totalDeliveries?.total || 0)) * 100
      : 0;

    res.json({
      success: true,
      message: "Delivery analytics fetched successfully",
      data: {
        deliveryTrends: deliveryTrends.map((trend: any) => ({
          date: trend.date,
          deliveryCount: Number(trend.delivery_count || 0),
        })),
        performance: {
          onTimeRate: Number(onTimeRate).toFixed(1),
          averageDeliveryTime: Number(averageDeliveryTime?.avgTime || 0).toFixed(1),
          totalDeliveries: Number(totalDeliveries?.total || 0),
        },
        deliveryByStatus: deliveryByStatus.map((status: any) => ({
          status: status.status,
          count: Number(status.count),
        })),
      },
    });
  } catch (error: any) {
    console.error("Delivery Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery analytics",
      error: error.message,
    });
  }
};

// 💬 Get Shop Communications
export const getShopCommunications = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const {
      page = '1',
      limit = '10',
      type = 'all',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("communications as comm")
      .leftJoin("customers as c", "comm.customer_id", "c.id")
      .leftJoin("orders as o", "comm.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .where("cake.shopId", shopId)
      .select(
        "comm.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "c.phone as customer_phone",
        "o.order_no"
      )
      .groupBy("comm.id", "c.full_name", "c.email", "c.phone", "o.order_no");

    // Apply filters
    if (type !== 'all') {
      query = query.where("comm.type", type);
    }
    
    if (status !== 'all') {
      query = query.where("comm.status", status);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("comm.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const communications = await query
      .orderBy(`comm.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get communication statistics
    const [totalCommunications, unreadCommunications, sentCommunications, receivedCommunications] = await Promise.all([
      knex("communications as comm")
        .leftJoin("orders as o", "comm.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .count({ total: "comm.id" })
        .first(),
      
      knex("communications as comm")
        .leftJoin("orders as o", "comm.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("comm.status", "unread")
        .count({ total: "comm.id" })
        .first(),
      
      knex("communications as comm")
        .leftJoin("orders as o", "comm.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("comm.direction", "outgoing")
        .count({ total: "comm.id" })
        .first(),
      
      knex("communications as comm")
        .leftJoin("orders as o", "comm.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("comm.direction", "incoming")
        .count({ total: "comm.id" })
        .first(),
    ]);

    res.json({
      success: true,
      message: "Shop communications fetched successfully",
      data: {
        communications,
        statistics: {
          totalCommunications: Number(totalCommunications?.total || 0),
          unreadCommunications: Number(unreadCommunications?.total || 0),
          sentCommunications: Number(sentCommunications?.total || 0),
          receivedCommunications: Number(receivedCommunications?.total || 0),
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error: any) {
    console.error("Get Shop Communications Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop communications",
      error: error.message,
    });
  }
};

// 📤 Send Message to Customer
export const sendMessageToCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { customerId, orderId, message, type = 'message' } = req.body;

    // Verify customer/order belongs to this shop
    let customerCheck = null;
    
    if (orderId) {
      customerCheck = await knex("orders as o")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("o.id", orderId)
        .where("c.shopId", shopId)
        .where("o.customer_id", customerId)
        .first();
    } else {
      customerCheck = await knex("orders as o")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("o.customer_id", customerId)
        .where("c.shopId", shopId)
        .first();
    }

    if (!customerCheck) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or has no orders with your shop",
      });
    }

    // Create communication record
    const communication = await knex("communications").insert({
      shop_id: shopId,
      customer_id: customerId,
      order_id: orderId || null,
      type,
      direction: 'outgoing',
      message,
      status: 'sent',
      sent_by: req.user?.id,
      created_at: new Date().toISOString(),
    }).returning('*');

    res.json({
      success: true,
      message: "Message sent successfully",
      data: communication[0],
    });
  } catch (error: any) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

// 📧 Send Bulk Message to Customers
export const sendBulkMessage = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const { customerIds, message, type = 'bulk_message' } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer IDs array is required",
      });
    }

    // Verify all customers have orders with this shop
    const validCustomers = await knex("orders as o")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .whereIn("o.customer_id", customerIds)
      .distinct("o.customer_id")
      .pluck("customer_id");

    const invalidCustomers = customerIds.filter(id => !validCustomers.includes(id));
    if (invalidCustomers.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Customers ${invalidCustomers.join(', ')} have no orders with your shop`,
      });
    }

    // Create bulk communication records
    const communications = await knex("communications").insert(
      customerIds.map(customerId => ({
        shop_id: shopId,
        customer_id: customerId,
        type,
        direction: 'outgoing',
        message,
        status: 'sent',
        sent_by: req.user?.id,
        created_at: new Date().toISOString(),
      }))
    ).returning('*');

    res.json({
      success: true,
      message: `Bulk message sent to ${customerIds.length} customers successfully`,
      data: {
        sentCount: communications.length,
        communications,
      },
    });
  } catch (error: any) {
    console.error("Send Bulk Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending bulk message",
      error: error.message,
    });
  }
};

// 📊 Get Communication Analytics
export const getCommunicationAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const shopId = req.user?.shopId;
    if (!shopId) {
      return res.status(403).json({
        success: false,
        message: "Shop ID not found for this admin",
      });
    }

    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Communication trends over time
    const communicationTrends = await knex("communications as comm")
      .leftJoin("orders as o", "comm.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("comm.created_at", ">=", startDate)
      .select(knex.raw("DATE(comm.created_at) as date"))
      .count("comm.id as messageCount")
      .groupBy(knex.raw("DATE(comm.created_at)"))
      .orderBy("date", "asc");

    // Communication by type
    const communicationByType = await knex("communications as comm")
      .leftJoin("orders as o", "comm.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .select("comm.type")
      .count("comm.id as count")
      .groupBy("comm.type");

    // Response time metrics
    const [averageResponseTime, responseRate] = await Promise.all([
      knex("communications as comm1")
        .leftJoin("communications as comm2", (builder: any) => {
          builder.on("comm1.customer_id", "=", "comm2.customer_id")
              .andOn("comm1.direction", "=", knex.raw("'incoming'"))
              .andOn("comm2.direction", "=", knex.raw("'outgoing'"))
              .andOn("comm2.created_at", ">", "comm1.created_at");
        })
        .leftJoin("orders as o", "comm1.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .avg({ avgResponseTime: knex.raw("TIMESTAMPDIFF(MINUTE, comm1.created_at, comm2.created_at)") })
        .first(),
      
      knex("communications as comm")
        .leftJoin("orders as o", "comm.order_id", "o.id")
        .leftJoin("order_items as oi", "o.id", "oi.order_id")
        .leftJoin("cakes as c", "oi.cake_id", "c.id")
        .where("c.shopId", shopId)
        .where("comm.direction", "incoming")
        .count({ totalIncoming: "comm.id" })
        .first(),
    ]);

    const respondedCount = await knex("communications as comm")
      .leftJoin("orders as o", "comm.order_id", "o.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("comm.direction", "incoming")
      .whereExists((builder: any) => {
        builder.select(1)
            .from("communications as comm2")
            .where("comm2.customer_id", "=", knex.raw("comm.customer_id"))
            .where("comm2.direction", "outgoing")
            .where("comm2.created_at", ">", knex.raw("comm.created_at"));
      })
      .count({ responded: "comm.id" })
      .first();

    const calculatedResponseRate = Number(responseRate?.totalIncoming || 0) > 0
      ? (Number(respondedCount?.responded || 0) / Number(responseRate?.totalIncoming || 0)) * 100
      : 0;

    res.json({
      success: true,
      message: "Communication analytics fetched successfully",
      data: {
        communicationTrends: communicationTrends.map((trend: any) => ({
          date: trend.date,
          messageCount: Number(trend.message_count || 0),
        })),
        communicationByType: communicationByType.map((type: any) => ({
          type: type.type,
          count: Number(type.count),
        })),
        metrics: {
          averageResponseTime: Number(averageResponseTime?.avgResponseTime || 0).toFixed(1),
          responseRate: Number(calculatedResponseRate).toFixed(1),
          totalIncoming: Number(responseRate?.totalIncoming || 0),
          totalResponded: Number(respondedCount?.responded || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Communication Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching communication analytics",
      error: error.message,
    });
  }
};
