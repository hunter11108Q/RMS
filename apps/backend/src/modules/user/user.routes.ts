import { Router } from 'express';
import userController from './user.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { createUserSchema, updateUserSchema } from '@rms/validation';

const userRouter = Router();

userRouter.use(requireAuth);

userRouter.post(
  '/',
  requirePermission('users:create'),
  validateBody(createUserSchema),
  userController.create
);

userRouter.get(
  '/',
  requirePermission('users:view'),
  userController.list
);

userRouter.get(
  '/:id',
  requirePermission('users:view'),
  userController.get
);

userRouter.patch(
  '/:id',
  requirePermission('users:update'),
  validateBody(updateUserSchema),
  userController.update
);

userRouter.delete(
  '/:id',
  requirePermission('users:delete'),
  userController.delete
);

export default userRouter;
