import { Request, Response, NextFunction } from 'express';
import reportService from './report.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class ReportController extends BaseController {

  // ─── Dashboard KPIs ───────────────────────────────────────────────────────
  public getDashboardKpis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getDashboardKpis({ branchId, startDate, endDate });
      await reportService.logReportGeneration(req.user.tenantId, req.user.id, 'DASHBOARD_KPI', req.query);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Sales Trend ──────────────────────────────────────────────────────────
  public getSalesTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { branchId, startDate, endDate, groupBy = 'day' } = req.query as Record<string, string>;
      const result = await reportService.getSalesTrend({ branchId, startDate, endDate, groupBy });
      await reportService.logReportGeneration(req.user.tenantId, req.user.id, 'SALES_TREND', req.query);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Hourly Sales ─────────────────────────────────────────────────────────
  public getHourlySales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getHourlySales({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Payment Breakdown ────────────────────────────────────────────────────
  public getPaymentBreakdown = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getPaymentBreakdown({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Category-wise Sales ──────────────────────────────────────────────────
  public getCategoryWiseSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getCategoryWiseSales({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Item-wise Sales ──────────────────────────────────────────────────────
  public getItemWiseSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getItemWiseSales({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Waiter-wise Sales ────────────────────────────────────────────────────
  public getWaiterWiseSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getWaiterWiseSales({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── GST Tax Report ───────────────────────────────────────────────────────
  public getGstReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getGstReport({ branchId, startDate, endDate });
      await reportService.logReportGeneration(req.user.tenantId, req.user.id, 'GST_TAX', req.query);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Profit & Loss ────────────────────────────────────────────────────────
  public getProfitLoss = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getProfitLoss({ branchId, startDate, endDate });
      await reportService.logReportGeneration(req.user.tenantId, req.user.id, 'PROFIT_LOSS', req.query);
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Inventory Report ─────────────────────────────────────────────────────
  public getInventoryReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getInventoryReport({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Customer Analytics ───────────────────────────────────────────────────
  public getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getCustomerAnalytics({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Kitchen Analytics ────────────────────────────────────────────────────
  public getKitchenAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getKitchenAnalytics({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Table Analytics ──────────────────────────────────────────────────────
  public getTableAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getTableAnalytics({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Branch Comparison ────────────────────────────────────────────────────
  public getBranchComparison = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getBranchComparison({ startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Food Cost Analysis ───────────────────────────────────────────────────
  public getFoodCostAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const result = await reportService.getFoodCostAnalysis({ limit });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // ─── Employee Sales Report ────────────────────────────────────────────────
  public getEmployeeSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, startDate, endDate } = req.query as Record<string, string>;
      const result = await reportService.getEmployeeSalesReport({ branchId, startDate, endDate });
      this.sendSuccess(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const reportController = new ReportController();
export default reportController;
