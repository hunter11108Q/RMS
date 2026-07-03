import { UserRole } from '@rms/constants';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const API_VERSION = 'v1';

export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field is required',
  INVALID_EMAIL: 'Invalid email address format',
  INVALID_UUID: 'Invalid UUID format',
  PASSWORD_LENGTH: 'Password must be at least 6 characters long',
};

export { UserRole };
