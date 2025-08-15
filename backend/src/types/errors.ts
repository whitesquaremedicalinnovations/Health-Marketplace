 export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource Management
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // Business Logic
  DOCTOR_ALREADY_EXISTS = 'DOCTOR_ALREADY_EXISTS',
  CLINIC_ALREADY_EXISTS = 'CLINIC_ALREADY_EXISTS',
  ALREADY_APPLIED = 'ALREADY_APPLIED',
  INVALID_OPERATION = 'INVALID_OPERATION',
  PITCH_NOT_PENDING = 'PITCH_NOT_PENDING',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',

  // Internal
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
    validationErrors?: ValidationError[];
    timestamp: string;
    path: string;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse; 