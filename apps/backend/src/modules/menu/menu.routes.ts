import { Router } from 'express';
import menuController from './menu.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createCategorySchema,
  createMenuItemSchema,
  createVariantSchema,
  createModifierGroupSchema,
  createRecipeSchema,
} from '@rms/validation';

const menuRouter = Router();

// Browse actions (public or basic auth)
menuRouter.get('/categories', menuController.listCategories);
menuRouter.get('/items', menuController.listItems);

// Write actions guarded by credentials
menuRouter.use(requireAuth);

menuRouter.post(
  '/categories',
  requirePermission('menu:update'),
  validateBody(createCategorySchema),
  menuController.createCategory
);

menuRouter.post(
  '/items',
  requirePermission('menu:update'),
  validateBody(createMenuItemSchema),
  menuController.createItem
);

menuRouter.post(
  '/items/:id/variants',
  requirePermission('menu:update'),
  validateBody(createVariantSchema),
  menuController.addVariant
);

menuRouter.post(
  '/modifiers',
  requirePermission('menu:update'),
  validateBody(createModifierGroupSchema),
  menuController.createModifierGroup
);

menuRouter.post(
  '/recipes',
  requirePermission('menu:update'),
  validateBody(createRecipeSchema),
  menuController.createRecipe
);

export default menuRouter;
