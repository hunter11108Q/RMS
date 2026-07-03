import { Request, Response, NextFunction } from 'express';
import billingService from './billing.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class BillingController extends BaseController {
  public generateBill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const bill = await billingService.generateBill(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, bill, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bill = await billingService.getBillById(req.params.id);
      if (!bill) return this.throwError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Invoice not found');
      this.sendSuccess(res, bill, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public processPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const tx = await billingService.processPayment(req.params.id, req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, tx, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public processRefund = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const refund = await billingService.processRefund(req.params.id, req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, refund, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public addDrawerLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const log = await billingService.addDrawerLog(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, log, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };
}

export const billingController = new BillingController();
export default billingController;
