import express, { Express, Router } from 'express';
import corsMiddleware from '../middleware/cors';
import rateLimiterMiddleware from '../middleware/rateLimiter';
import securityHeadersMiddleware from '../middleware/securityHeaders';
import compressionMiddleware from '../middleware/compression';
import requestLogger from '../middleware/requestLogger';
import errorHandlerMiddleware from '../middleware/errorHandler';
import { HTTP_STATUS, API_VERSION } from '../constants/index';
import authRouter from '../modules/auth/auth.routes';
import userRouter from '../modules/user/user.routes';
import roleRouter from '../modules/role/role.routes';
import shiftRouter from '../modules/shift/shift.routes';
import restaurantRouter from '../modules/restaurant/restaurant.routes';
import branchRouter from '../modules/branch/branch.routes';
import menuRouter from '../modules/menu/menu.routes';
import tableRouter from '../modules/table/table.routes';
import orderRouter from '../modules/order/order.routes';
import billingRouter from '../modules/billing/billing.routes';
import inventoryRouter from '../modules/inventory/inventory.routes';
import reportRouter from '../modules/report/report.routes';

const app: Express = express();

// 1. Register Core Security & Performance Middlewares
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(express.json());
app.use(requestLogger);

// 2. Expose Health Monitoring Endpoints (Liveness, Readiness, Health)
const healthRouter = Router();

// Liveness check (checks if process is running)
healthRouter.get('/live', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'UP', service: 'API' });
});

// Readiness check (checks if process is ready to receive requests)
healthRouter.get('/ready', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'READY' });
});

import redisService from '../services/redis';

// Overall health diagnostic check
healthRouter.get('/health', (req, res) => {
  const redisHealth = redisService.checkHealth();
  res.status(HTTP_STATUS.OK).json({
    status: redisHealth.status === 'UP' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    services: {
      api: { status: 'UP' },
      redis: redisHealth,
    },
  });
});

app.use('/health', healthRouter);
app.use('/live', (req, res) => res.status(HTTP_STATUS.OK).json({ status: 'UP' }));
app.use('/ready', (req, res) => res.status(HTTP_STATUS.OK).json({ status: 'READY' }));

// 3. Mount REST Versioned Routing Group
const apiRouter = Router();

// Route group mounting
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/roles', roleRouter);
apiRouter.use('/shifts', shiftRouter);
apiRouter.use('/restaurant', restaurantRouter);
apiRouter.use('/branches', branchRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/tables', tableRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/billing', billingRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/reports', reportRouter);

// Rate limit endpoints
app.use(`/api/${API_VERSION}`, rateLimiterMiddleware, apiRouter);

// Scaffold check route
apiRouter.get('/status', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      active: true,
      scaffold: 'COMPLETE',
    },
    timestamp: new Date().toISOString(),
  });
});

// 4. Global Error boundary middleware
app.use(errorHandlerMiddleware);

export default app;
