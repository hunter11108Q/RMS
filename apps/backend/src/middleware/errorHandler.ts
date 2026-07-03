import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index';
import { HTTP_STATUS } from '../constants/index';
import logger from '../services/logger';

export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err instanceof AppError ? err.details : undefined;

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(`Unhandled Exception: ${err.message}`, {
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
      context: 'GlobalErrorHandler',
    });
  } else {
    logger.warn(`Operational Error [${errorCode}]: ${message}`, {
      path: req.originalUrl,
      details,
      context: 'GlobalErrorHandler',
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  });
}

export default errorHandlerMiddleware;
