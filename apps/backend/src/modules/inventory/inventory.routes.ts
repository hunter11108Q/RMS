import { Router } from 'express';
import inventoryController from './inventory.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createSupplierSchema,
  createPOSchema,
  wastageEntrySchema,
} from '@rms/validation';

const inventoryRouter = Router();

inventoryRouter.use(requireAuth);

inventoryRouter.post(
  '/suppliers',
  requirePermission('inventory:supplier:create'),
  validateBody(createSupplierSchema),
  inventoryController.createSupplier
);

inventoryRouter.post(
  '/purchase-orders',
  requirePermission('inventory:purchase:create'),
  validateBody(createPOSchema),
  inventoryController.createPO
);

inventoryRouter.get(
  '/recipe-costing/:menuItemId',
  requirePermission('inventory:read'),
  inventoryController.getRecipeCosting
);

inventoryRouter.post(
  '/wastage',
  requirePermission('inventory:adjust'),
  validateBody(wastageEntrySchema),
  inventoryController.createWastage
);

inventoryRouter.post(
  '/transfers',
  requirePermission('inventory:adjust'),
  inventoryController.createTransfer
);

export default inventoryRouter;
