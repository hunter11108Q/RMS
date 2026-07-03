import { Router } from 'express';
import roleController from './role.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { createRoleSchema, updateRoleSchema } from '@rms/validation';

const roleRouter = Router();

roleRouter.use(requireAuth);

roleRouter.post(
  '/',
  requirePermission('roles:create'),
  validateBody(createRoleSchema),
  roleController.create
);

roleRouter.get(
  '/',
  requirePermission('roles:view'),
  roleController.list
);

roleRouter.get(
  '/:id',
  requirePermission('roles:view'),
  roleController.get
);

roleRouter.patch(
  '/:id',
  requirePermission('roles:update'),
  validateBody(updateRoleSchema),
  roleController.update
);

roleRouter.delete(
  '/:id',
  requirePermission('roles:delete'),
  roleController.delete
);

roleRouter.post(
  '/:id/clone',
  requirePermission('roles:create'),
  roleController.clone
);

export default roleRouter;
