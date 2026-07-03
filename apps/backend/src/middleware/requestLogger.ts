import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      context: 'HTTP',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });
  next();
}
export default requestLogger;
