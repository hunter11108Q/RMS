import { Request, Response, NextFunction } from 'express';
import roleService from './role.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class RoleController extends BaseController {
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const role = await roleService.create(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, role, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const role = await roleService.getById(req.params.id, req.user.tenantId);
      if (!role) return this.throwError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Role not found');
      this.sendSuccess(res, role, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const roles = await roleService.list(req.user.tenantId);
      this.sendSuccess(res, roles, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const role = await roleService.update(req.params.id, req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, role, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      await roleService.delete(req.params.id, req.user.id, req.user.tenantId);
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public clone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const { newName } = req.body;
      const role = await roleService.clone(req.params.id, newName, req.user.id, req.user.tenantId);
      this.sendSuccess(res, role, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };
}

export const roleController = new RoleController();
export default roleController;
