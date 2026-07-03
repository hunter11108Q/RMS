import { Request, Response, NextFunction } from 'express';
import orderService from './order.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class OrderController extends BaseController {
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const order = await orderService.createOrder(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, order, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return this.throwError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Order not found');
      this.sendSuccess(res, order, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await orderService.addOrderItem(req.params.id, req.body);
      this.sendSuccess(res, item, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public hold = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderService.holdOrder(req.params.id);
      this.sendSuccess(res, order, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- KOT Handlers ---
  public generateKOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { branchId } = req.body;
      const kots = await orderService.generateKOT(req.params.id, branchId, req.user.id);
      this.sendSuccess(res, kots, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public updateKOTStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body;
      const kot = await orderService.updateKOTStatus(req.params.id, status);
      this.sendSuccess(res, kot, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public listKOTs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const tickets = await orderService.listKOTs(branchId);
      this.sendSuccess(res, tickets, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      const status = req.query.status as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const orders = await orderService.listOrders(branchId, status);
      this.sendSuccess(res, orders, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const orderController = new OrderController();
export default orderController;
