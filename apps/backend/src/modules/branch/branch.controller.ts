import { Request, Response, NextFunction } from 'express';
import branchService from './branch.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class BranchController extends BaseController {
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const branch = await branchService.create(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, branch, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const branch = await branchService.getById(req.params.id, req.user.tenantId);
      if (!branch) return this.throwError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Branch not found');
      this.sendSuccess(res, branch, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const branches = await branchService.list(req.user.tenantId);
      this.sendSuccess(res, branches, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const branch = await branchService.update(req.params.id, req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, branch, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- Sub-Entities Handlers ---
  public addFloor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const floor = await branchService.addFloor(req.params.id, req.body);
      this.sendSuccess(res, floor, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public addTax = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tax = await branchService.addTax(req.params.id, req.body);
      this.sendSuccess(res, tax, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public addPrinter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const printer = await branchService.addPrinter(req.params.id, req.body);
      this.sendSuccess(res, printer, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };
}

export const branchController = new BranchController();
export default branchController;
