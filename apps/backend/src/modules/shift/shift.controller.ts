import { Request, Response, NextFunction } from 'express';
import shiftService from './shift.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class ShiftController extends BaseController {
  public open = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, openingCash, notes } = req.body;
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const shift = await shiftService.open(req.user.id, branchId, openingCash, notes);
      this.sendSuccess(res, shift, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public close = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { closingCash, notes } = req.body;
      const { id } = req.params;
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const shift = await shiftService.close(id, req.user.id, closingCash, notes);
      this.sendSuccess(res, shift, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const shift = await shiftService.getActive(req.user.id, branchId);
      this.sendSuccess(res, shift, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const shiftController = new ShiftController();
export default shiftController;
