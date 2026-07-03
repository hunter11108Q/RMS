import cors from 'cors';
import config from '../config/index';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Dynamically allow any loopback localhost ports (mobile apps, cashier POS dev ports)
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      config.security.corsOrigin === '*' ||
      origin === config.security.corsOrigin
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
});

export default corsMiddleware;
