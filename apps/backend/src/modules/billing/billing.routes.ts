import { Router } from 'express';
import billingController from './billing.controller';
import { requireAuth, requirePermission } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import {
  createBillSchema,
  processPaymentSchema,
  processRefundSchema,
  cashDrawerEntrySchema,
} from '@rms/validation';

const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.post(
  '/',
  requirePermission('billing:create'),
  validateBody(createBillSchema),
  billingController.generateBill
);

billingRouter.get('/:id', billingController.get);

billingRouter.post(
  '/:id/payments',
  requirePermission('billing:create'),
  validateBody(processPaymentSchema),
  billingController.processPayment
);

billingRouter.post(
  '/:id/refunds',
  requirePermission('billing:void'),
  validateBody(processRefundSchema),
  billingController.processRefund
);

billingRouter.post(
  '/drawer/logs',
  requirePermission('shift:manage'),
  validateBody(cashDrawerEntrySchema),
  billingController.addDrawerLog
);

export default billingRouter;
