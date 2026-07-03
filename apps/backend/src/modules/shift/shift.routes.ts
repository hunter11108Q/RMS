import { Router } from 'express';
import shiftController from './shift.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { openShiftSchema, closeShiftSchema } from '@rms/validation';

const shiftRouter = Router();

shiftRouter.use(requireAuth);

shiftRouter.post(
  '/open',
  requirePermission('pos:open-cash-drawer'), // Wait, open drawer permission or specialized shift permission is fine
  validateBody(openShiftSchema),
  shiftController.open
);

shiftRouter.post(
  '/:id/close',
  validateBody(closeShiftSchema),
  shiftController.close
);

shiftRouter.get(
  '/active',
  shiftController.getActive
);

export default shiftRouter;
