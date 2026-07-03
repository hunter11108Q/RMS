import { ErrorCode } from '@rms/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode | string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface WsMessageEnvelope<T = any> {
  event: string;
  branchId: string;
  senderId: string;
  timestamp: string;
  payload: T;
}

export interface SyncBatchRequest {
  branchId: string;
  lastSyncedTimestamp: number;
  mutations: any[];
}

export interface SyncBatchResponse {
  successCount: number;
  failedMutations: { uuid: string; error: string }[];
  serverTimestamp: number;
}

/**
 * Creates a standard error API response envelope
 */
export function createErrorResponse(
  code: ErrorCode | string,
  message: string,
  details?: any
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a standard success API response envelope
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
