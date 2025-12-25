import express from "express";
import { 
  getSuperAdminDashboardAnalytics,
  getTopPerformingShops,
  getTopSellingCakes,
  getRecentEnquiries,
  getSystemRevenueChartData,
  getQuickStats,
  getAllOrdersManagement,
  getOrderStatistics,
  updateOrderStatusAdmin,
  getOrderDetailsAdmin,
  getSystemSettings,
  updateSystemSettings,
  getSecuritySettings,
  getSystemHealth,
  getEmailTemplates,
  updateEmailTemplate,
  getShopAnalytics,
  getShopPerformanceComparison,
  getShopLeaderboard,
  getCustomerAnalytics,
  getCustomerBehaviorPatterns,
  getCustomerLifetimeValue,
  getAuditLogs,
  getSecurityEvents,
  getSecurityDashboard
} from "../controller/superAdminController";
import ensureAuthenticated from "../middleware/Auth";

const superAdminRouter = express.Router();

// 📊 Dashboard Analytics
superAdminRouter.get("/dashboard/analytics", ensureAuthenticated, getSuperAdminDashboardAnalytics);

// 📈 Chart Data
superAdminRouter.get("/dashboard/revenue-chart", ensureAuthenticated, getSystemRevenueChartData);

// ⚡ Quick Stats
superAdminRouter.get("/dashboard/quick-stats", ensureAuthenticated, getQuickStats);

// 🏪 Top Performing Shops
superAdminRouter.get("/dashboard/top-shops", ensureAuthenticated, getTopPerformingShops);

// 🍰 Top Selling Cakes
superAdminRouter.get("/dashboard/top-cakes", ensureAuthenticated, getTopSellingCakes);

// 📋 Recent Enquiries
superAdminRouter.get("/dashboard/recent-enquiries", ensureAuthenticated, getRecentEnquiries);

// 📦 Order Management
superAdminRouter.get("/orders", ensureAuthenticated, getAllOrdersManagement);
superAdminRouter.get("/orders/statistics", ensureAuthenticated, getOrderStatistics);
superAdminRouter.get("/orders/:id", ensureAuthenticated, getOrderDetailsAdmin);
superAdminRouter.put("/orders/:id/status", ensureAuthenticated, updateOrderStatusAdmin);

// 🏪 Shop Analytics
superAdminRouter.get("/shops/analytics/:shopId", ensureAuthenticated, getShopAnalytics);
superAdminRouter.get("/shops/performance-comparison", ensureAuthenticated, getShopPerformanceComparison);
superAdminRouter.get("/shops/leaderboard", ensureAuthenticated, getShopLeaderboard);

// 👥 Customer Analytics
superAdminRouter.get("/customers/analytics", ensureAuthenticated, getCustomerAnalytics);
superAdminRouter.get("/customers/behavior-patterns", ensureAuthenticated, getCustomerBehaviorPatterns);
superAdminRouter.get("/customers/lifetime-value", ensureAuthenticated, getCustomerLifetimeValue);

// ⚙️ System Settings
superAdminRouter.get("/settings", ensureAuthenticated, getSystemSettings);
superAdminRouter.put("/settings", ensureAuthenticated, updateSystemSettings);
superAdminRouter.get("/settings/security", ensureAuthenticated, getSecuritySettings);
superAdminRouter.get("/settings/health", ensureAuthenticated, getSystemHealth);

// 📧 Email Templates
superAdminRouter.get("/settings/email-templates", ensureAuthenticated, getEmailTemplates);
superAdminRouter.put("/settings/email-templates/:id", ensureAuthenticated, updateEmailTemplate);

// 🔒 Security & Audit
superAdminRouter.get("/security/audit-logs", ensureAuthenticated, getAuditLogs);
superAdminRouter.get("/security/events", ensureAuthenticated, getSecurityEvents);
superAdminRouter.get("/security/dashboard", ensureAuthenticated, getSecurityDashboard);

// Legacy endpoint for backward compatibility
superAdminRouter.get("/dashboard", ensureAuthenticated, getSuperAdminDashboardAnalytics);

export default superAdminRouter;
