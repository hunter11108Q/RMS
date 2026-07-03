import { Response } from 'express';
import { AppError } from '../errors/index';
import { ErrorCode } from '@rms/constants';

export abstract class BaseController {
  protected sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  protected throwError(statusCode: number, errorCode: ErrorCode | string, message: string, details?: any): never {
    throw new AppError(statusCode, errorCode, message, details);
  }
}

export default BaseController;
