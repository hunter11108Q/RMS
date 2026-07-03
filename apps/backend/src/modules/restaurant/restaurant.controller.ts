import { Request, Response, NextFunction } from 'express';
import restaurantService from './restaurant.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class RestaurantController extends BaseController {
  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const profile = await restaurantService.createOrUpdate(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, profile, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const profile = await restaurantService.getProfile(req.user.tenantId);
      this.sendSuccess(res, profile, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };
}

export const restaurantController = new RestaurantController();
export default restaurantController;
