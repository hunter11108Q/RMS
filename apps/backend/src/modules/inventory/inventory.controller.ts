import { Request, Response, NextFunction } from 'express';
import inventoryService from './inventory.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class InventoryController extends BaseController {
  public createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const supplier = await inventoryService.createSupplier(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, supplier, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public createPO = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const po = await inventoryService.createPO(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, po, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public getRecipeCosting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const costing = await inventoryService.getRecipeCosting(req.params.menuItemId);
      this.sendSuccess(res, costing, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public createWastage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const wastage = await inventoryService.createWastage(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, wastage, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public createTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const transfer = await inventoryService.createTransfer(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, transfer, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };
}

export const inventoryController = new InventoryController();
export default inventoryController;
