import { Router } from 'express';
import authController from './auth.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validation';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  loginSchema,
  passwordChangeSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from '@rms/validation';

const authRouter = Router();

// Rate limited public auth routes
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post('/password/reset-request', authRateLimiter, validateBody(passwordResetRequestSchema), authController.requestReset);

// Rotates & confirm resets
authRouter.post('/refresh', authController.rotate);
authRouter.post('/password/reset-confirm', validateBody(passwordResetConfirmSchema), authController.confirmReset);

// Authenticated auth routes
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.currentUser);
authRouter.post('/password/change', requireAuth, validateBody(passwordChangeSchema), authController.changePassword);

// Session endpoints
authRouter.get('/sessions', requireAuth, authController.getSessions);
authRouter.post('/sessions/revoke', requireAuth, authController.revokeSession);

export default authRouter;
