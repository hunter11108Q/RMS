import { ErrorCode } from '@rms/constants';
import { HTTP_STATUS } from '../constants/index';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode | string;
  public readonly details: any;

  constructor(statusCode: number, errorCode: ErrorCode | string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: any) {
    super(HTTP_STATUS.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication credentials missing or invalid') {
    super(HTTP_STATUS.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied. Insufficient permissions') {
    super(HTTP_STATUS.FORBIDDEN, ErrorCode.FORBIDDEN, message);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: any) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'State conflict detected', details?: any) {
    super(HTTP_STATUS.CONFLICT, ErrorCode.CONFLICT, message, details);
  }
}
