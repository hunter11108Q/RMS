import { Router } from 'express';
import branchController from './branch.controller';
import { requireAuth, requireRoles } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createBranchSchema,
  createFloorSchema,
  createTaxSchema,
  createPrinterSchema,
} from '@rms/validation';
import { UserRole } from '../../constants/index';

const branchRouter = Router();

branchRouter.use(requireAuth);

branchRouter.get('/', branchController.list);
branchRouter.get('/:id', branchController.get);

// Stricter write guards
branchRouter.post(
  '/',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR]),
  validateBody(createBranchSchema),
  branchController.create
);

branchRouter.patch(
  '/:id',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR]),
  branchController.update
);

// Sub-Entities Config routes
branchRouter.post(
  '/:id/floors',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR, UserRole.MANAGER]),
  validateBody(createFloorSchema),
  branchController.addFloor
);

branchRouter.post(
  '/:id/taxes',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR]),
  validateBody(createTaxSchema),
  branchController.addTax
);

branchRouter.post(
  '/:id/printers',
  requireRoles([UserRole.OWNER, UserRole.ADMINISTRATOR]),
  validateBody(createPrinterSchema),
  branchController.addPrinter
);

export default branchRouter;
