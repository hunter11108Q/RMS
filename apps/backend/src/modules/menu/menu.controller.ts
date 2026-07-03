import { Request, Response, NextFunction } from 'express';
import menuService from './menu.service';
import { HTTP_STATUS } from '../../constants/index';
import { BaseController } from '../../controllers/base';

export class MenuController extends BaseController {
  // --- Category Handlers ---
  public createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const category = await menuService.createCategory(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, category, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public listCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const categories = await menuService.listCategories(req.user.tenantId);
      this.sendSuccess(res, categories, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- MenuItem Handlers ---
  public createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) return this.throwError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Access Denied');
      const item = await menuService.createItem(req.body, req.user.id, req.user.tenantId);
      this.sendSuccess(res, item, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  public listItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      const search = req.query.search as string;
      if (!branchId) return this.throwError(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_FAILED', 'branchId parameter is required');
      const items = await menuService.listItems(branchId, search);
      this.sendSuccess(res, items, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  };

  // --- Variant Handlers ---
  public addVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const variant = await menuService.addVariant(req.params.id, req.body);
      this.sendSuccess(res, variant, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  // --- Modifier Handlers ---
  public createModifierGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId } = req.body;
      const group = await menuService.createModifierGroup(branchId, req.body);
      this.sendSuccess(res, group, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };

  // --- Recipe Handlers ---
  public createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipe = await menuService.createRecipe(req.body);
      this.sendSuccess(res, recipe, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  };
}

export const menuController = new MenuController();
export default menuController;
