import { Router } from 'express';
import orderController from './order.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createOrderSchema,
  addOrderItemSchema,
  updateKOTStatusSchema,
} from '@rms/validation';

const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.get('/', orderController.list);

orderRouter.post(
  '/',
  requirePermission('order:create'),
  validateBody(createOrderSchema),
  orderController.create
);

orderRouter.get('/:id', orderController.get);

orderRouter.post(
  '/:id/items',
  requirePermission('order:create'),
  validateBody(addOrderItemSchema),
  orderController.addItem
);

orderRouter.post(
  '/:id/hold',
  requirePermission('order:create'),
  orderController.hold
);

// KOT routing
orderRouter.get('/kots/list', orderController.listKOTs);

orderRouter.post(
  '/:id/kots',
  requirePermission('order:kot'),
  orderController.generateKOT
);

orderRouter.patch(
  '/kots/:id/status',
  requirePermission('order:kot'),
  validateBody(updateKOTStatusSchema),
  orderController.updateKOTStatus
);

export default orderRouter;
