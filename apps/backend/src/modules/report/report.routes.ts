import { Router } from 'express';
import reportController from './report.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';

const reportRouter = Router();

reportRouter.use(requireAuth);

// ─── Dashboard KPIs ────────────────────────────────────────────────────────
reportRouter.get(
  '/dashboard/kpis',
  requirePermission('reports:view'),
  reportController.getDashboardKpis
);

// ─── Sales Reports ──────────────────────────────────────────────────────────
reportRouter.get(
  '/sales/trend',
  requirePermission('reports:sales'),
  reportController.getSalesTrend
);

reportRouter.get(
  '/sales/hourly',
  requirePermission('reports:sales'),
  reportController.getHourlySales
);

reportRouter.get(
  '/sales/payment-breakdown',
  requirePermission('reports:sales'),
  reportController.getPaymentBreakdown
);

reportRouter.get(
  '/sales/by-category',
  requirePermission('reports:sales'),
  reportController.getCategoryWiseSales
);

reportRouter.get(
  '/sales/by-item',
  requirePermission('reports:sales'),
  reportController.getItemWiseSales
);

reportRouter.get(
  '/sales/by-waiter',
  requirePermission('reports:sales'),
  reportController.getWaiterWiseSales
);

reportRouter.get(
  '/sales/by-employee',
  requirePermission('reports:sales'),
  reportController.getEmployeeSalesReport
);

// ─── GST & Tax Reports ──────────────────────────────────────────────────────
reportRouter.get(
  '/tax/gst-summary',
  requirePermission('reports:tax'),
  reportController.getGstReport
);

// ─── Profit & Loss ──────────────────────────────────────────────────────────
reportRouter.get(
  '/finance/profit-loss',
  requirePermission('reports:finance'),
  reportController.getProfitLoss
);

// ─── Inventory Reports ──────────────────────────────────────────────────────
reportRouter.get(
  '/inventory/summary',
  requirePermission('reports:inventory'),
  reportController.getInventoryReport
);

// ─── Food Cost Analysis ─────────────────────────────────────────────────────
reportRouter.get(
  '/food-cost/analysis',
  requirePermission('reports:inventory'),
  reportController.getFoodCostAnalysis
);

// ─── Customer Analytics ─────────────────────────────────────────────────────
reportRouter.get(
  '/customers/analytics',
  requirePermission('reports:customers'),
  reportController.getCustomerAnalytics
);

// ─── Kitchen Analytics ──────────────────────────────────────────────────────
reportRouter.get(
  '/kitchen/analytics',
  requirePermission('reports:kitchen'),
  reportController.getKitchenAnalytics
);

// ─── Table Analytics ────────────────────────────────────────────────────────
reportRouter.get(
  '/tables/analytics',
  requirePermission('reports:tables'),
  reportController.getTableAnalytics
);

// ─── Branch Analytics ───────────────────────────────────────────────────────
reportRouter.get(
  '/branches/comparison',
  requirePermission('reports:branches'),
  reportController.getBranchComparison
);

export default reportRouter;
