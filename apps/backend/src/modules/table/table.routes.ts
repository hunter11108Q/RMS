import { Router } from 'express';
import tableController from './table.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createTableSchema,
  updateTablePositionSchema,
  createReservationSchema,
  createWaitlistSchema,
} from '@rms/validation';

const tableRouter = Router();

// Basic list fetches (available to waiters/staff)
tableRouter.get('/', tableController.listTables);
tableRouter.get('/reservations', tableController.listReservations);
tableRouter.get('/waitlist', tableController.listWaitlist);

// Seating write guards
tableRouter.use(requireAuth);

tableRouter.post(
  '/',
  requirePermission('table:configure'),
  validateBody(createTableSchema),
  tableController.createTable
);

tableRouter.patch(
  '/:id/position',
  requirePermission('table:configure'),
  validateBody(updateTablePositionSchema),
  tableController.updatePosition
);

tableRouter.patch(
  '/:id/status',
  requirePermission('table:status'),
  tableController.updateStatus
);

tableRouter.post(
  '/merge',
  requirePermission('table:status'),
  tableController.mergeTables
);

tableRouter.post(
  '/split',
  requirePermission('table:status'),
  tableController.splitTables
);

tableRouter.post(
  '/reservations',
  requirePermission('table:status'),
  validateBody(createReservationSchema),
  tableController.createReservation
);

tableRouter.post(
  '/waitlist',
  requirePermission('table:status'),
  validateBody(createWaitlistSchema),
  tableController.addWaitlist
);

export default tableRouter;
