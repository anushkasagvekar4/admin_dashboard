import { Request, Response } from "express";
import knex from "../db/knexInstance";
import { Order } from "../models/orders";
import { Shop } from "../models/shop";
import { Customer } from "../models/customer";

// Helper function to get start date based on period
const getStartDate = (period: string): string => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return startDate.toISOString();
};

// Helper function to get previous period start date
const getPreviousStartDate = (period: string): string => {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 14);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 2);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    default:
      startDate.setDate(now.getDate() - 14);
  }
  
  return startDate.toISOString();
};

// Helper function to get revenue chart data
const getRevenueChartData = async (period: string) => {
  const startDate = getStartDate(period);
  const groupBy = period === 'year' ? 'DATE_TRUNC(\'month\', o.created_at)' : 
                  period === 'month' ? 'DATE_TRUNC(\'week\', o.created_at)' : 
                  'DATE(o.created_at)';
  
  const revenueChart = await knex("order_items as oi")
    .join("orders as o", "oi.order_id", "o.id")
    .join("shops as s", "oi.cake_id", "in (SELECT id FROM cakes WHERE shopId = s.id)")
    .where("o.created_at", ">=", startDate)
    .select(knex.raw(`${groupBy} as date`))
    .sum({ revenue: knex.raw("oi.price * oi.qty") })
    .countDistinct({ orders: "o.id" })
    .countDistinct({ newShops: "DISTINCT CASE WHEN s.created_at >= ${startDate} THEN s.id END" })
    .groupBy(knex.raw(groupBy))
    .orderBy('date', 'asc');
    
  return revenueChart.map((item: any) => ({
    date: new Date(item.date).toISOString().split('T')[0],
    revenue: Number(item.revenue || 0),
    orders: Number(item.orders || 0),
    newShops: Number(item.newShops || 0),
    newCustomers: 0, // TODO: Add customer tracking
  }));
};

// 📊 Get Comprehensive Super Admin Dashboard Analytics
export const getSuperAdminDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);
    
    // 🧮 Total Revenue
    const totalRevenueResult = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .sum({ total_revenue: knex.raw("oi.price * oi.qty") })
      .first();

    // 🧮 Total Orders
    const totalOrdersResult = await knex("orders")
      .where("created_at", ">=", startDate)
      .count("id as total_orders")
      .first();

    // 🧮 Active/Inactive Shops
    const activeShopsResult = await knex("shops")
      .where("status", "active")
      .count("id as active_shops")
      .first();
      
    const inactiveShopsResult = await knex("shops")
      .where("status", "inactive")
      .count("id as inactive_shops")
      .first();

    // 🧮 Total Customers
    const totalCustomersResult = await knex("auth")
      .where("role", "customer")
      .count("id as total_customers")
      .first();

    // 🧮 Total Cakes
    const totalCakesResult = await knex("cakes")
      .count("id as total_cakes")
      .first();

    // 🧮 Enquiry Statistics
    const pendingEnquiriesResult = await knex("enquiries")
      .where("status", "pending")
      .count("id as pending_enquiries")
      .first();
      
    const approvedEnquiriesResult = await knex("enquiries")
      .where("status", "approved")
      .count("id as approved_enquiries")
      .first();
      
    const rejectedEnquiriesResult = await knex("enquiries")
      .where("status", "rejected")
      .count("id as rejected_enquiries")
      .first();

    // 📈 Growth Calculations
    const previousStartDate = getPreviousStartDate(period);
    
    const previousRevenueResult = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", previousStartDate)
      .where("o.created_at", "<", startDate)
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .first();

    const previousOrdersResult = await knex("orders")
      .where("created_at", ">=", previousStartDate)
      .where("created_at", "<", startDate)
      .count("id as orders")
      .first();

    const previousShopsResult = await knex("shops")
      .where("created_at", ">=", previousStartDate)
      .where("created_at", "<", startDate)
      .count("id as shops")
      .first();

    const previousCustomersResult = await knex("auth")
      .where("role", "customer")
      .where("created_at", ">=", previousStartDate)
      .where("created_at", "<", startDate)
      .count("id as customers")
      .first();

    const currentRevenue = Number(totalRevenueResult?.total_revenue || 0);
    const previousRevenue = Number(previousRevenueResult?.revenue || 0);
    const currentOrders = Number(totalOrdersResult?.total_orders || 0);
    const previousOrders = Number(previousOrdersResult?.orders || 0);
    const currentShops = Number(activeShopsResult?.active_shops || 0);
    const previousShops = Number(previousShopsResult?.shops || 0);
    const currentCustomers = Number(totalCustomersResult?.total_customers || 0);
    const previousCustomers = Number(previousCustomersResult?.customers || 0);

    // 🏪 Top Performing Shops
    const topShops = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname",
        "s.ownername",
        "s.email",
        "s.city",
        "s.status",
        "s.created_at"
      )
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ totalOrders: "o.id" })
      .groupBy("s.id", "s.shopname", "s.ownername", "s.email", "s.city", "s.status", "s.created_at")
      .orderBy("totalRevenue", "desc")
      .limit(5);

    // 🍰 Top Selling Cakes
    const topCakes = await knex("cakes as c")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("shops as s", "c.shopId", "s.id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.cake_name",
        "c.price",
        "c.images",
        "s.shopname as shopName"
      )
      .sum({ totalOrders: "oi.qty" })
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.price", "c.images", "s.shopname")
      .orderBy("totalRevenue", "desc")
      .limit(5);

    // 📋 Recent Enquiries
    const recentEnquiries = await knex("enquiries")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(5);

    // 📊 Revenue Chart Data
    const revenueChart = await getRevenueChartData(period);

    const stats = {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders,
      activeShops: currentShops,
      inactiveShops: Number(inactiveShopsResult?.inactive_shops || 0),
      totalCustomers: currentCustomers,
      totalCakes: Number(totalCakesResult?.total_cakes || 0),
      pendingEnquiries: Number(pendingEnquiriesResult?.pending_enquiries || 0),
      approvedEnquiries: Number(approvedEnquiriesResult?.approved_enquiries || 0),
      rejectedEnquiries: Number(rejectedEnquiriesResult?.rejected_enquiries || 0),
      revenueGrowth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0,
      ordersGrowth: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders * 100) : 0,
      shopsGrowth: previousShops > 0 ? ((currentShops - previousShops) / previousShops * 100) : 0,
      customersGrowth: previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers * 100) : 0,
    };

    res.json({
      success: true,
      message: "Super admin dashboard analytics fetched successfully",
      data: {
        stats,
        topShops: topShops.map(shop => ({
          ...shop,
          totalRevenue: Number(shop.totalRevenue || 0),
          totalOrders: Number(shop.totalOrders || 0),
        })),
        topCakes: topCakes.map((cake: any) => ({
          ...cake,
          totalOrders: Number(cake.totalOrders || 0),
          totalRevenue: Number(cake.totalRevenue || 0),
          image: (cake as any).images ? (typeof (cake as any).images === 'string' ? JSON.parse((cake as any).images) : (cake as any).images)[0] : null,
        })),
        recentEnquiries,
        revenueChart,
      },
    });
  } catch (error: any) {
    console.error("Super Admin Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching super admin dashboard data",
      error: error.message,
    });
  }
};

// 🏪 Get Top Performing Shops
export const getTopPerformingShops = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'revenue';
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);
    
    const orderBy = sortBy === 'revenue' ? 'totalRevenue' : 'totalOrders';
    
    const topShops = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname",
        "s.ownername",
        "s.email",
        "s.city",
        "s.status",
        "s.created_at"
      )
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ totalOrders: "o.id" })
      .groupBy("s.id", "s.shopname", "s.ownername", "s.email", "s.city", "s.status", "s.created_at")
      .orderBy(orderBy, "desc")
      .limit(limit);

    res.json({
      success: true,
      message: "Top performing shops fetched successfully",
      data: topShops.map(shop => ({
        ...shop,
        totalRevenue: Number(shop.totalRevenue || 0),
        totalOrders: Number(shop.totalOrders || 0),
      })),
    });
  } catch (error: any) {
    console.error("Top Shops Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top shops",
      error: error.message,
    });
  }
};

// 🍰 Get Top Selling Cakes
export const getTopSellingCakes = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);
    
    const topCakes = await knex("cakes as c")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("shops as s", "c.shopId", "s.id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.cake_name",
        "c.price",
        "c.images",
        "s.shopname as shopName"
      )
      .sum({ totalOrders: "oi.qty" })
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.price", "c.images", "s.shopname")
      .orderBy("totalRevenue", "desc")
      .limit(limit);

    res.json({
      success: true,
      message: "Top selling cakes fetched successfully",
      data: topCakes.map((cake: any) => ({
        ...cake,
        totalOrders: Number(cake.totalOrders || 0),
        totalRevenue: Number(cake.totalRevenue || 0),
        image: (cake as any).images ? (typeof (cake as any).images === 'string' ? JSON.parse((cake as any).images) : (cake as any).images)[0] : null,
      })),
    });
  } catch (error: any) {
    console.error("Top Cakes Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top cakes",
      error: error.message,
    });
  }
};

// 📋 Get Recent Enquiries
export const getRecentEnquiries = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    
    let query = knex("enquiries").select("*").orderBy("created_at", "desc").limit(limit);
    
    if (status) {
      query = query.where("status", status);
    }
    
    const recentEnquiries = await query;

    res.json({
      success: true,
      message: "Recent enquiries fetched successfully",
      data: recentEnquiries,
    });
  } catch (error: any) {
    console.error("Recent Enquiries Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent enquiries",
      error: error.message,
    });
  }
};

// 📊 Get System Revenue Chart Data
export const getSystemRevenueChartData = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const revenueChart = await getRevenueChartData(period);

    res.json({
      success: true,
      message: "Revenue chart data fetched successfully",
      data: revenueChart,
    });
  } catch (error: any) {
    console.error("Revenue Chart Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue chart data",
      error: error.message,
    });
  }
};

// ⚡ Get Quick Stats Update
export const getQuickStats = async (req: Request, res: Response) => {
  try {
    const totalRevenueResult = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .sum({ total_revenue: knex.raw("oi.price * oi.qty") })
      .first();

    const totalOrdersResult = await knex("orders")
      .count("id as total_orders")
      .first();

    const activeShopsResult = await knex("shops")
      .where("status", "active")
      .count("id as active_shops")
      .first();

    const totalCustomersResult = await knex("auth")
      .where("role", "customer")
      .count("id as total_customers")
      .first();

    const stats = {
      totalRevenue: Number(totalRevenueResult?.total_revenue || 0),
      totalOrders: Number(totalOrdersResult?.total_orders || 0),
      activeShops: Number(activeShopsResult?.active_shops || 0),
      totalCustomers: Number(totalCustomersResult?.total_customers || 0),
    };

    res.json({
      success: true,
      message: "Quick stats fetched successfully",
      data: stats,
    });
  } catch (error: any) {
    console.error("Quick Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching quick stats",
      error: error.message,
    });
  }
};

// 📦 Get All Orders with Advanced Filtering
export const getAllOrdersManagement = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      trackingStatus,
      shopId,
      customerId,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("shops as s", "o.shop_id", "s.id")
      .select(
        "o.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "c.phone as customer_phone",
        "s.shopname",
        "s.city as shop_city"
      );

    // Apply filters
    if (status) {
      query = query.where("o.status", status);
    }
    
    if (trackingStatus) {
      query = query.where("o.tracking_status", trackingStatus);
    }
    
    if (shopId) {
      query = query.where("o.shop_id", shopId);
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
          .leftJoin("shops as s", "c.shopId", "s.id")
          .where("oi.order_id", order.id)
          .select(
            "oi.*",
            "c.cake_name",
            "c.images",
            "s.shopname as cake_shopname"
          );

        return {
          ...order,
          items: items.map((item: any) => ({
            ...item,
            image: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images)[0] : null,
            total: Number(item.price || 0) * Number(item.qty || 0),
          })),
          orderTotal: items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0),
        };
      })
    );

    res.json({
      success: true,
      message: "Orders fetched successfully",
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
    console.error("Orders Management Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// 📊 Get Order Statistics
export const getOrderStatistics = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Order status breakdown
    const statusBreakdown = await knex("orders")
      .where("created_at", ">=", startDate)
      .select("status")
      .count("id as count")
      .sum({ totalAmount: knex.raw("(SELECT COALESCE(SUM(oi.price * oi.qty), 0) FROM order_items oi WHERE oi.order_id = orders.id)") })
      .groupBy("status");

    // Tracking status breakdown
    const trackingStatusBreakdown = await knex("orders")
      .where("created_at", ">=", startDate)
      .select("tracking_status")
      .count("id as count")
      .groupBy("tracking_status");

    // Daily order trends
    const dailyTrends = await knex("orders")
      .where("created_at", ">=", startDate)
      .select(knex.raw("DATE(created_at) as date"))
      .count("id as orders")
      .sum({ revenue: knex.raw("(SELECT COALESCE(SUM(oi.price * oi.qty), 0) FROM order_items oi WHERE oi.order_id = orders.id)") })
      .groupBy(knex.raw("DATE(created_at)"))
      .orderBy("date", "asc");

    // Shop performance
    const shopPerformance = await knex("shops as s")
      .leftJoin("orders as o", "s.id", "o.shop_id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname",
        "s.city"
      )
      .countDistinct({ orderCount: "o.id" })
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .groupBy("s.id", "s.shopname", "s.city")
      .orderBy("totalRevenue", "desc")
      .limit(10);

    res.json({
      success: true,
      message: "Order statistics fetched successfully",
      data: {
        statusBreakdown: statusBreakdown.map((item: any) => ({
          status: item.status,
          count: Number(item.count),
          totalAmount: Number(item.totalAmount || 0),
        })),
        trackingStatusBreakdown: trackingStatusBreakdown.map((item: any) => ({
          trackingStatus: item.tracking_status,
          count: Number(item.count),
        })),
        dailyTrends: dailyTrends.map((item: any) => ({
          date: item.date,
          orders: Number(item.orders),
          revenue: Number(item.revenue || 0),
        })),
        shopPerformance: shopPerformance.map(shop => ({
          ...shop,
          totalRevenue: Number(shop.totalRevenue || 0),
          avgOrderValue: Number(shop.avgOrderValue || 0),
        })),
      },
    });
  } catch (error: any) {
    console.error("Order Statistics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

// 🔄 Update Order Status (Super Admin)
export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingStatus, adminNote } = req.body;

    // Validate order exists
    const order = await knex("orders").where("id", id).first();
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order
    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingStatus) updateData.tracking_status = trackingStatus;
    updateData.updated_at = new Date().toISOString();

    await knex("orders").where("id", id).update(updateData);

    // Log admin action (if audit logging is implemented)
    if (adminNote) {
      await knex("order_admin_notes").insert({
        order_id: id,
        admin_id: (req as any).user?.id,
        note: adminNote,
        created_at: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: "Order updated successfully",
      data: {
        id,
        ...updateData,
      },
    });
  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// 📋 Get Order Details with Full History
export const getOrderDetailsAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get order with customer and shop info
    const order = await knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("shops as s", "o.shop_id", "s.id")
      .select(
        "o.*",
        "c.full_name as customer_name",
        "c.email as customer_email",
        "c.phone as customer_phone",
        "c.address as customer_address",
        "s.shopname",
        "s.email as shop_email",
        "s.phone as shop_phone"
      )
      .where("o.id", id)
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get order items
    const items = await knex("order_items as oi")
      .leftJoin("cakes as c", "oi.cake_id", "c.id")
      .leftJoin("shops as s", "c.shopId", "s.id")
      .where("oi.order_id", id)
      .select(
        "oi.*",
        "c.cake_name",
        "c.images",
        "c.description",
        "s.shopname as cake_shopname"
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

    // Get order status history (if implemented)
    const statusHistory = await knex("order_status_history")
      .where("order_id", id)
      .orderBy("created_at", "desc");

    res.json({
      success: true,
      message: "Order details fetched successfully",
      data: {
        order: {
          ...order,
          items: items.map((item: any) => ({
            ...item,
            image: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images)[0] : null,
            total: Number(item.price || 0) * Number(item.qty || 0),
          })),
          orderTotal: items.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0),
        },
        adminNotes,
        statusHistory,
      },
    });
  } catch (error: any) {
    console.error("Order Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// ⚙️ Get System Settings
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings = await knex("system_settings").select("*").orderBy("category", "asc");
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        isPublic: setting.is_public,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      message: "System settings fetched successfully",
      data: groupedSettings,
    });
  } catch (error: any) {
    console.error("Get System Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system settings",
      error: error.message,
    });
  }
};

// ⚙️ Update System Settings
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body; // Array of { key, value } objects
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: "Settings must be an array",
      });
    }

    // Update each setting
    await Promise.all(
      settings.map(async ({ key, value }: { key: string; value: any }) => {
        await knex("system_settings")
          .where("key", key)
          .update({
            value,
            updated_at: new Date().toISOString(),
          });
      })
    );

    // Log admin action
    await knex("admin_activity_log").insert({
      admin_id: (req as any).user?.id,
      action: "update_system_settings",
      details: JSON.stringify({ settings_updated: settings.length }),
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "System settings updated successfully",
    });
  } catch (error: any) {
    console.error("Update System Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating system settings",
      error: error.message,
    });
  }
};

// 🔒 Get Security Settings
export const getSecuritySettings = async (req: Request, res: Response) => {
  try {
    const securitySettings = await knex("system_settings")
      .where("category", "security")
      .select("*");

    const securityLogs = await knex("admin_activity_log")
      .leftJoin("auth", "admin_activity_log.admin_id", "auth.id")
      .select(
        "admin_activity_log.*",
        "auth.email as admin_email"
      )
      .orderBy("admin_activity_log.created_at", "desc")
      .limit(50);

    res.json({
      success: true,
      message: "Security settings fetched successfully",
      data: {
        settings: securitySettings.map(setting => ({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
        })),
        recentActivity: securityLogs,
      },
    });
  } catch (error: any) {
    console.error("Get Security Settings Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching security settings",
      error: error.message,
    });
  }
};

// 📊 Get System Health
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    // Database connection test
    const dbHealth = await knex.raw("SELECT 1 as test").then(() => "healthy").catch(() => "unhealthy");
    
    // Get system metrics
    const metrics = {
      totalUsers: await knex("auth").count("id as count").then((result: any) => Number(result[0]?.count || 0)),
      totalShops: await knex("shops").count("id as count").then((result: any) => Number(result[0]?.count || 0)),
      totalOrders: await knex("orders").count("id as count").then((result: any) => Number(result[0]?.count || 0)),
      totalRevenue: await knex("order_items").sum({ total: knex.raw("price * qty") }).then((result: any) => Number(result[0]?.total || 0)),
      diskUsage: process.env.NODE_ENV === "production" ? "N/A" : "Development Mode",
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };

    // Recent errors (if error logging is implemented)
    const recentErrors = await knex("error_logs")
      .where("created_at", ">=", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .count("id as count")
      .then((result: any) => Number(result[0]?.count || 0));

    res.json({
      success: true,
      message: "System health fetched successfully",
      data: {
        status: dbHealth === "healthy" ? "healthy" : "degraded",
        database: dbHealth,
        metrics,
        recentErrors,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("System Health Error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking system health",
      error: error.message,
    });
  }
};

// 📧 Get Email Templates
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await knex("email_templates")
      .select("*")
      .orderBy("template_name", "asc");

    res.json({
      success: true,
      message: "Email templates fetched successfully",
      data: templates.map(template => ({
        id: template.id,
        templateName: template.template_name,
        subject: template.subject,
        content: template.content,
        variables: template.variables ? JSON.parse(template.variables) : [],
        isActive: template.is_active,
      })),
    });
  } catch (error: any) {
    console.error("Get Email Templates Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching email templates",
      error: error.message,
    });
  }
};

// 📧 Update Email Template
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, content, variables, isActive } = req.body;

    const template = await knex("email_templates").where("id", id).first();
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    await knex("email_templates").where("id", id).update({
      subject,
      content,
      variables: JSON.stringify(variables || []),
      is_active: isActive,
      updated_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Email template updated successfully",
    });
  } catch (error: any) {
    console.error("Update Email Template Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating email template",
      error: error.message,
    });
  }
};

// 🏪 Get Detailed Shop Analytics
export const getShopAnalytics = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Shop basic info
    const shop = await knex("shops").where("id", shopId).first();
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

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

    // Top selling products
    const topProducts = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.cake_name",
        "c.price",
        "c.images"
      )
      .sum({ totalSold: "oi.qty" })
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.cake_name", "c.price", "c.images")
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
      .sum({ totalAmount: knex.raw("oi.price * oi.qty") })
      .groupBy("o.status", "o.tracking_status");

    // Performance metrics
    const performanceMetrics = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("s.id", shopId)
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname"
      )
      .countDistinct({ totalOrders: "o.id" })
      .countDistinct({ totalProducts: "c.id" })
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .first();

    // Monthly comparison
    const monthlyComparison = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("c.shopId", shopId)
      .where("o.created_at", ">=", getStartDate('month'))
      .select(knex.raw("DATE_TRUNC('week', o.created_at) as week"))
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ orders: "o.id" })
      .groupBy(knex.raw("DATE_TRUNC('week', o.created_at)"))
      .orderBy("week", "asc")
      .limit(4);

    res.json({
      success: true,
      message: "Shop analytics fetched successfully",
      data: {
        shop: {
          ...shop,
          performanceMetrics: {
            totalOrders: Number(performanceMetrics?.totalOrders || 0),
            totalProducts: Number(performanceMetrics?.totalProducts || 0),
            totalRevenue: Number(performanceMetrics?.totalRevenue || 0),
            avgOrderValue: Number(performanceMetrics?.avgOrderValue || 0),
          },
        },
        revenueTrends: revenueTrends.map((item: any) => ({
          date: item.date,
          revenue: Number(item.revenue || 0),
          orders: Number(item.orders || 0),
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
          avgOrderValue: Number(customer.avgOrderValue || 0),
        })),
        orderStatusBreakdown: orderStatusBreakdown.map((item: any) => ({
          status: item.status,
          trackingStatus: item.tracking_status,
          count: Number(item.count),
          totalAmount: Number(item.totalAmount || 0),
        })),
        monthlyComparison: monthlyComparison.map((item: any) => ({
          week: item.week,
          revenue: Number(item.revenue || 0),
          orders: Number(item.orders || 0),
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

// 📊 Get Shop Performance Comparison
export const getShopPerformanceComparison = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);
    const limit = parseInt(req.query.limit as string) || 20;

    // Shop performance comparison
    const shopComparison = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname",
        "s.ownername",
        "s.city",
        "s.status"
      )
      .countDistinct({ totalOrders: "o.id" })
      .countDistinct({ totalProducts: "c.id" })
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .sum({ totalItemsSold: "oi.qty" })
      .groupBy("s.id", "s.shopname", "s.ownername", "s.city", "s.status")
      .orderBy("totalRevenue", "desc")
      .limit(limit);

    // Calculate percentiles
    const revenues = shopComparison.map(shop => Number(shop.totalRevenue || 0)).sort((a, b) => b - a);
    const revenuePercentiles = {
      p90: revenues[Math.floor(revenues.length * 0.1)] || 0,
      p75: revenues[Math.floor(revenues.length * 0.25)] || 0,
      p50: revenues[Math.floor(revenues.length * 0.5)] || 0,
      p25: revenues[Math.floor(revenues.length * 0.75)] || 0,
    };

    // Shop growth rates
    const growthRates = await Promise.all(
      shopComparison.map(async (shop: any) => {
        const previousPeriodRevenue = await knex("order_items as oi")
          .join("orders as o", "oi.order_id", "o.id")
          .join("cakes as c", "oi.cake_id", "c.id")
          .where("c.shopId", shop.id)
          .where("o.created_at", ">=", getPreviousStartDate(period))
          .where("o.created_at", "<", startDate)
          .sum({ revenue: knex.raw("oi.price * oi.qty") })
          .first();

        const currentRevenue = Number(shop.totalRevenue || 0);
        const previousRevenue = Number(previousPeriodRevenue?.revenue || 0);
        const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;

        return {
          shopId: shop.id,
          growthRate,
        };
      })
    );

    res.json({
      success: true,
      message: "Shop performance comparison fetched successfully",
      data: {
        shops: shopComparison.map((shop: any, index: number) => {
          const growth = growthRates.find(g => g.shopId === shop.id);
          const revenue = Number(shop.totalRevenue || 0);
          
          return {
            ...shop,
            totalOrders: Number(shop.totalOrders || 0),
            totalProducts: Number(shop.totalProducts || 0),
            totalRevenue: revenue,
            avgOrderValue: Number(shop.avgOrderValue || 0),
            totalItemsSold: Number(shop.totalItemsSold || 0),
            growthRate: growth?.growthRate || 0,
            rank: index + 1,
            percentile: {
              revenue: revenue >= revenuePercentiles.p90 ? 90 :
                       revenue >= revenuePercentiles.p75 ? 75 :
                       revenue >= revenuePercentiles.p50 ? 50 :
                       revenue >= revenuePercentiles.p25 ? 25 : 0,
            },
          };
        }),
        benchmarks: {
          revenuePercentiles,
          totalShops: shopComparison.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Shop Performance Comparison Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop performance comparison",
      error: error.message,
    });
  }
};

// 🏆 Get Shop Leaderboard
export const getShopLeaderboard = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const metric = req.query.metric as string || 'revenue';
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = getStartDate(period);

    let orderBy, selectFields;
    
    switch (metric) {
      case 'orders':
        orderBy = 'orderCount';
        selectFields = {
          orderCount: knex.raw('COUNT(DISTINCT o.id)'),
        };
        break;
      case 'products':
        orderBy = 'productCount';
        selectFields = {
          productCount: knex.raw('COUNT(DISTINCT c.id)'),
        };
        break;
      case 'avg_order':
        orderBy = 'avgOrderValue';
        selectFields = {
          avgOrderValue: knex.raw('AVG(oi.price * oi.qty)'),
        };
        break;
      default: // revenue
        orderBy = 'totalRevenue';
        selectFields = {
          totalRevenue: knex.raw('SUM(oi.price * oi.qty)'),
        };
    }

    const leaderboard = await knex("shops as s")
      .leftJoin("cakes as c", "s.id", "c.shopId")
      .leftJoin("order_items as oi", "c.id", "oi.cake_id")
      .leftJoin("orders as o", "oi.order_id", "o.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "s.id",
        "s.shopname",
        "s.ownername",
        "s.city",
        "s.logo",
        selectFields
      )
      .groupBy("s.id", "s.shopname", "s.ownername", "s.city", "s.logo")
      .orderBy(orderBy, "desc")
      .limit(limit);

    res.json({
      success: true,
      message: "Shop leaderboard fetched successfully",
      data: {
        metric,
        period,
        leaderboard: leaderboard.map((shop: any, index: number) => ({
          ...shop,
          rank: index + 1,
          totalRevenue: Number(shop.totalRevenue || 0),
          orderCount: Number(shop.orderCount || 0),
          productCount: Number(shop.productCount || 0),
          avgOrderValue: Number(shop.avgOrderValue || 0),
        })),
      },
    });
  } catch (error: any) {
    console.error("Shop Leaderboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop leaderboard",
      error: error.message,
    });
  }
};

// 👥 Get Customer Analytics Overview
export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Customer growth trends
    const customerGrowth = await knex("auth")
      .where("role", "customer")
      .where("created_at", ">=", startDate)
      .select(knex.raw("DATE(created_at) as date"))
      .count("id as new_customers")
      .groupBy(knex.raw("DATE(created_at)"))
      .orderBy("date", "asc");

    // Customer segmentation by spending
    const customerSegmentation = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .where("o.created_at", ">=", startDate)
      .select("c.id", "c.full_name", "c.email")
      .sum({ totalSpent: knex.raw("oi.price * oi.qty") })
      .countDistinct({ orderCount: "o.id" })
      .groupBy("c.id", "c.full_name", "c.email");

    // Segment customers into tiers
    const segments = customerSegmentation.reduce((acc: any, customer: any) => {
      const spent = Number(customer.totalSpent || 0);
      const orders = Number(customer.orderCount || 0);
      
      let segment = 'new';
      if (spent >= 1000) segment = 'vip';
      else if (spent >= 500) segment = 'premium';
      else if (spent >= 100) segment = 'regular';
      else if (orders > 0) segment = 'active';
      
      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {});

    // Customer behavior metrics
    const behaviorMetrics = await knex("orders as o")
      .leftJoin("customers as c", "o.customer_id", "c.id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .where("o.created_at", ">=", startDate)
      .select(
        knex.raw("COUNT(DISTINCT c.id) as active_customers"),
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw("AVG(oi.price * oi.qty) as avg_order_value"),
        knex.raw("SUM(oi.price * oi.qty) as total_revenue")
      )
      .first();

    // Customer retention analysis
    const retentionAnalysis = await knex("customers as c")
      .leftJoin("orders as o1", "c.id", "o1.customer_id")
      .leftJoin("orders as o2", function() {
        this.on("c.id", "=", "o2.customer_id")
          .andOn("o2.created_at", ">", knex.raw("o1.created_at + INTERVAL '7 days'"));
      })
      .where("c.created_at", ">=", getPreviousStartDate(period))
      .where("c.created_at", "<", startDate)
      .select(
        knex.raw("COUNT(DISTINCT c.id) as cohort_customers"),
        knex.raw("COUNT(DISTINCT CASE WHEN o2.id IS NOT NULL THEN c.id END) as retained_customers")
      )
      .first();

    const retentionRate = Number(retentionAnalysis?.cohort_customers || 0) > 0 
      ? (Number(retentionAnalysis?.retained_customers || 0) / Number(retentionAnalysis?.cohort_customers || 0)) * 100 
      : 0;

    // Top customers by revenue
    const topCustomers = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.full_name",
        "c.email",
        "c.phone"
      )
      .sum({ totalSpent: knex.raw("oi.price * oi.qty") })
      .countDistinct({ orderCount: "o.id" })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.id", "c.full_name", "c.email", "c.phone")
      .orderBy("totalSpent", "desc")
      .limit(10);

    res.json({
      success: true,
      message: "Customer analytics fetched successfully",
      data: {
        growthTrends: customerGrowth.map((item: any) => ({
          date: item.date,
          newCustomers: Number(item.new_customers),
        })),
        segmentation: segments,
        behaviorMetrics: {
          activeCustomers: Number(behaviorMetrics?.active_customers || 0),
          totalOrders: Number(behaviorMetrics?.total_orders || 0),
          avgOrderValue: Number(behaviorMetrics?.avg_order_value || 0),
          totalRevenue: Number(behaviorMetrics?.total_revenue || 0),
        },
        retentionRate,
        topCustomers: topCustomers.map(customer => ({
          ...customer,
          totalSpent: Number(customer.totalSpent || 0),
          orderCount: Number(customer.orderCount || 0),
          avgOrderValue: Number(customer.avgOrderValue || 0),
        })),
      },
    });
  } catch (error: any) {
    console.error("Customer Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer analytics",
      error: error.message,
    });
  }
};

// 🎯 Get Customer Behavior Patterns
export const getCustomerBehaviorPatterns = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Purchase frequency analysis
    const purchaseFrequency = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .where("o.created_at", ">=", startDate)
      .select("c.id")
      .countDistinct({ orderCount: "o.id" })
      .groupBy("c.id");

    const frequencyDistribution = purchaseFrequency.reduce((acc: any, customer: any) => {
      const orders = Number(customer.orderCount || 0);
      let bucket = '0';
      if (orders === 1) bucket = '1';
      else if (orders <= 3) bucket = '2-3';
      else if (orders <= 5) bucket = '4-5';
      else if (orders <= 10) bucket = '6-10';
      else bucket = '10+';
      
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    // Peak ordering times
    const peakOrderingTimes = await knex("orders")
      .where("created_at", ">=", startDate)
      .select(
        knex.raw("EXTRACT(HOUR FROM created_at) as hour"),
        knex.raw("EXTRACT(DOW FROM created_at) as day_of_week")
      )
      .count("id as order_count")
      .groupBy(knex.raw("EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)"))
      .orderBy("order_count", "desc")
      .limit(10);

    // Popular product categories
    const popularCategories = await knex("order_items as oi")
      .join("orders as o", "oi.order_id", "o.id")
      .join("cakes as c", "oi.cake_id", "c.id")
      .where("o.created_at", ">=", startDate)
      .select("c.category")
      .sum({ totalOrders: "oi.qty" })
      .sum({ revenue: knex.raw("oi.price * oi.qty") })
      .groupBy("c.category")
      .orderBy("revenue", "desc")
      .limit(10);

    // Customer journey mapping
    const customerJourney = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("cakes as cake", "oi.cake_id", "cake.id")
      .leftJoin("shops as s", "cake.shopId", "s.id")
      .where("o.created_at", ">=", startDate)
      .select(
        "c.id",
        "c.full_name",
        "c.created_at as registration_date",
        knex.raw("MIN(o.created_at) as first_order_date"),
        knex.raw("MAX(o.created_at) as last_order_date"),
        knex.raw("COUNT(DISTINCT o.id) as total_orders"),
        knex.raw("COUNT(DISTINCT s.id) as unique_shops"),
        knex.raw("SUM(oi.price * oi.qty) as total_spent")
      )
      .groupBy("c.id", "c.full_name", "c.created_at")
      .orderBy("total_spent", "desc")
      .limit(20);

    // Churn risk analysis
    const churnRisk = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .where("o.created_at", ">=", getPreviousStartDate('month'))
      .where("o.created_at", "<", startDate)
      .select("c.id", "c.full_name", "c.email")
      .countDistinct({ orderCount: "o.id" })
      .max({ lastOrderDate: "o.created_at" })
      .groupBy("c.id", "c.full_name", "c.email")
      .having("orderCount", ">", 0);

    const atRiskCustomers = churnRisk
      .filter((customer: any) => {
        const daysSinceLastOrder = (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastOrder > 30;
      })
      .slice(0, 10);

    res.json({
      success: true,
      message: "Customer behavior patterns fetched successfully",
      data: {
        purchaseFrequency: frequencyDistribution,
        peakOrderingTimes: peakOrderingTimes.map((item: any) => ({
          hour: Number(item.hour),
          dayOfWeek: Number(item.day_of_week),
          orderCount: Number(item.order_count),
        })),
        popularCategories: popularCategories.map((category: any) => ({
          category: (category as any).category,
          totalOrders: Number(category.totalOrders || 0),
          revenue: Number(category.revenue || 0),
        })),
        customerJourney: customerJourney.map((journey: any) => ({
          customerId: journey.id,
          customerName: journey.full_name,
          registrationDate: journey.registration_date,
          firstOrderDate: journey.first_order_date,
          lastOrderDate: journey.last_order_date,
          totalOrders: Number(journey.total_orders || 0),
          uniqueShops: Number(journey.unique_shops || 0),
          totalSpent: Number(journey.total_spent || 0),
        })),
        churnRisk: {
          atRiskCustomers: atRiskCustomers.map((customer: any) => ({
            customerId: (customer as any).id,
            customerName: (customer as any).full_name,
            email: (customer as any).email,
            orderCount: Number(customer.orderCount || 0),
            lastOrderDate: customer.lastOrderDate,
          })),
          totalAtRisk: atRiskCustomers.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Customer Behavior Patterns Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer behavior patterns",
      error: error.message,
    });
  }
};

// 📊 Get Customer Lifetime Value
export const getCustomerLifetimeValue = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // CLV calculation
    const clvData = await knex("customers as c")
      .leftJoin("orders as o", "c.id", "o.customer_id")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .select(
        "c.id",
        "c.full_name",
        "c.email",
        "c.created_at"
      )
      .sum({ totalRevenue: knex.raw("oi.price * oi.qty") })
      .countDistinct({ totalOrders: "o.id" })
      .avg({ avgOrderValue: knex.raw("oi.price * oi.qty") })
      .min({ firstOrderDate: "o.created_at" })
      .max({ lastOrderDate: "o.created_at" })
      .groupBy("c.id", "c.full_name", "c.email", "c.created_at")
      .having("totalOrders", ">", 0);

    // Calculate CLV metrics
    const clvMetrics = clvData.map((customer: any) => {
      const totalRevenue = Number(customer.totalRevenue || 0);
      const totalOrders = Number(customer.totalOrders || 0);
      const avgOrderValue = Number(customer.avgOrderValue || 0);
      
      // Customer age in days
      const customerAge = customer.firstOrderDate 
        ? (Date.now() - new Date(customer.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24)
        : 0;
      
      // Purchase frequency (days between orders)
      const purchaseFrequency = customerAge > 0 && totalOrders > 1 
        ? customerAge / (totalOrders - 1)
        : customerAge;
      
      // Simple CLV calculation
      const clv = avgOrderValue * (customerAge / Math.max(purchaseFrequency, 1));
      
      return {
        ...customer,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        customerAge: Math.round(customerAge),
        purchaseFrequency: Math.round(purchaseFrequency),
        clv: Math.round(clv),
      };
    });

    // CLV distribution
    const clvDistribution = clvMetrics.reduce((acc: any, customer: any) => {
      let bucket = 'low';
      if (customer.clv >= 1000) bucket = 'high';
      else if (customer.clv >= 500) bucket = 'medium-high';
      else if (customer.clv >= 200) bucket = 'medium';
      
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    // Top CLV customers
    const topClvCustomers = clvMetrics
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 20);

    res.json({
      success: true,
      message: "Customer lifetime value data fetched successfully",
      data: {
        distribution: clvDistribution,
        topCustomers: topClvCustomers,
        metrics: {
          totalCustomers: clvMetrics.length,
          avgClv: Math.round(clvMetrics.reduce((sum, c) => sum + c.clv, 0) / clvMetrics.length),
          medianClv: Math.round(clvMetrics.sort((a, b) => a.clv - b.clv)[Math.floor(clvMetrics.length / 2)]?.clv || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Customer Lifetime Value Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer lifetime value data",
      error: error.message,
    });
  }
};

// 🔒 Get Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      action,
      adminId,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    let query = knex("admin_activity_log as log")
      .leftJoin("auth", "log.admin_id", "auth.id")
      .select(
        "log.*",
        "auth.email as admin_email",
        "auth.role"
      );

    // Apply filters
    if (action) {
      query = query.where("log.action", "like", `%${action}%`);
    }
    
    if (adminId) {
      query = query.where("log.admin_id", adminId);
    }
    
    if (dateFrom) {
      query = query.where("log.created_at", ">=", dateFrom);
    }
    
    if (dateTo) {
      query = query.where("log.created_at", "<=", dateTo);
    }

    // Get total count for pagination
    const countQuery = query.clone().clearSelect().count("log.id as total");
    const totalResult = await countQuery.first();
    const total = Number(totalResult?.total || 0);

    // Apply sorting and pagination
    const logs = await query
      .orderBy(`log.${sortBy as string}`, sortOrder as string)
      .limit(parseInt(limit as string))
      .offset(offset);

    res.json({
      success: true,
      message: "Audit logs fetched successfully",
      data: {
        logs: logs.map((log: any) => ({
          id: log.id,
          adminId: log.admin_id,
          adminEmail: log.admin_email,
          adminRole: log.role,
          action: log.action,
          details: log.details ? JSON.parse(log.details) : null,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
          createdAt: log.created_at,
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
    console.error("Get Audit Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error.message,
    });
  }
};

// 🔍 Get Security Events
export const getSecurityEvents = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Failed login attempts
    const failedLogins = await knex("security_events")
      .where("event_type", "failed_login")
      .where("created_at", ">=", startDate)
      .select("*")
      .orderBy("created_at", "desc")
      .limit(20);

    // Suspicious activities
    const suspiciousActivities = await knex("security_events")
      .where("event_type", "suspicious_activity")
      .where("created_at", ">=", startDate)
      .select("*")
      .orderBy("created_at", "desc")
      .limit(20);

    // Permission changes
    const permissionChanges = await knex("security_events")
      .where("event_type", "permission_change")
      .where("created_at", ">=", startDate)
      .select("*")
      .orderBy("created_at", "desc")
      .limit(20);

    // Data access logs
    const dataAccess = await knex("security_events")
      .where("event_type", "data_access")
      .where("created_at", ">=", startDate)
      .select("*")
      .orderBy("created_at", "desc")
      .limit(20);

    // Security metrics
    const securityMetrics = await knex("security_events")
      .where("created_at", ">=", startDate)
      .select("event_type")
      .count("id as count")
      .groupBy("event_type");

    res.json({
      success: true,
      message: "Security events fetched successfully",
      data: {
        failedLogins: failedLogins.map((event: any) => ({
          ...event,
          details: event.details ? JSON.parse(event.details) : null,
        })),
        suspiciousActivities: suspiciousActivities.map((event: any) => ({
          ...event,
          details: event.details ? JSON.parse(event.details) : null,
        })),
        permissionChanges: permissionChanges.map((event: any) => ({
          ...event,
          details: event.details ? JSON.parse(event.details) : null,
        })),
        dataAccess: dataAccess.map((event: any) => ({
          ...event,
          details: event.details ? JSON.parse(event.details) : null,
        })),
        metrics: securityMetrics.map((metric: any) => ({
          eventType: metric.event_type,
          count: Number(metric.count),
        })),
      },
    });
  } catch (error: any) {
    console.error("Get Security Events Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching security events",
      error: error.message,
    });
  }
};

// 📝 Log Security Event (Utility function)
export const logSecurityEvent = async (
  eventType: string,
  userId: string,
  details: any,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    await knex("security_events").insert({
      event_type: eventType,
      user_id: userId,
      details: JSON.stringify(details),
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

// 🛡️ Get Security Dashboard
export const getSecurityDashboard = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'week';
    const startDate = getStartDate(period);

    // Security overview metrics
    const securityOverview = await knex("security_events")
      .where("created_at", ">=", startDate)
      .select(
        knex.raw("COUNT(DISTINCT CASE WHEN event_type = 'failed_login' THEN user_id END) as unique_failed_logins"),
        knex.raw("COUNT(DISTINCT CASE WHEN event_type = 'suspicious_activity' THEN user_id END) as suspicious_users"),
        knex.raw("COUNT(DISTINCT CASE WHEN event_type = 'permission_change' THEN user_id END) as permission_changes"),
        knex.raw("COUNT(DISTINCT user_id) as total_active_users")
      )
      .first();

    // Recent security alerts
    const recentAlerts = await knex("security_events")
      .where("created_at", ">=", startDate)
      .where("severity", "high")
      .select("*")
      .orderBy("created_at", "desc")
      .limit(10);

    // Threat trends
    const threatTrends = await knex("security_events")
      .where("created_at", ">=", startDate)
      .select(knex.raw("DATE(created_at) as date"), "event_type")
      .count("id as count")
      .groupBy(knex.raw("DATE(created_at)"), "event_type")
      .orderBy("date", "asc");

    // Top risk factors
    const riskFactors = await knex("security_events")
      .where("created_at", ">=", startDate)
      .select("event_type")
      .count("id as occurrences")
      .groupBy("event_type")
      .orderBy("occurrences", "desc")
      .limit(5);

    // Admin activity summary
    const adminActivity = await knex("admin_activity_log")
      .where("created_at", ">=", startDate)
      .select("action")
      .count("id as count")
      .groupBy("action")
      .orderBy("count", "desc")
      .limit(10);

    res.json({
      success: true,
      message: "Security dashboard data fetched successfully",
      data: {
        overview: {
          uniqueFailedLogins: Number(securityOverview?.unique_failed_logins || 0),
          suspiciousUsers: Number(securityOverview?.suspicious_users || 0),
          permissionChanges: Number(securityOverview?.permission_changes || 0),
          totalActiveUsers: Number(securityOverview?.total_active_users || 0),
        },
        recentAlerts: recentAlerts.map((alert: any) => ({
          ...alert,
          details: alert.details ? JSON.parse(alert.details) : null,
        })),
        threatTrends: threatTrends.map((trend: any) => ({
          date: trend.date,
          eventType: trend.event_type,
          count: Number(trend.count),
        })),
        riskFactors: riskFactors.map((factor: any) => ({
          eventType: factor.event_type,
          occurrences: Number(factor.occurrences),
        })),
        adminActivity: adminActivity.map((activity: any) => ({
          action: activity.action,
          count: Number(activity.count),
        })),
      },
    });
  } catch (error: any) {
    console.error("Security Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching security dashboard data",
      error: error.message,
    });
  }
};
