import { Request, Response, NextFunction } from 'express';
import userService from './user.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class UserController extends BaseController {
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const user = await userService.create(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, user, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const user = await userService.getById(req.params.id, req.user.tenantId);
      if (!user) return this.throwError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'User account not found');
      this.sendSuccess(res, user, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const users = await userService.list(req.user.tenantId, req.query);
      this.sendSuccess(res, users, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const user = await userService.update(req.params.id, req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, user, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      await userService.delete(req.params.id, req.user.id, req.user.tenantId);
      this.sendSuccess(res, { success: true }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const userController = new UserController();
export default userController;
