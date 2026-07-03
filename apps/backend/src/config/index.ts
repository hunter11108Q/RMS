import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

export const config = {
  env,
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rms_db',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Security Configurations
  security: {
    jwtSecret: process.env.JWT_SECRET || 'jwt-secret-placeholder-do-not-use-in-prod',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret-placeholder',
    jwtAccessExpiry: '15m',
    jwtRefreshExpiry: '7d',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    bcryptRounds: 12,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100, // max 100 requests per window per IP
  },

  // Logging Configs
  logging: {
    level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
    filePath: path.join(__dirname, '../../logs'),
  },

  // Uploads Storage Directory
  uploads: {
    dir: path.join(__dirname, '../../uploads'),
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
  }
};

export default config;
