import { ErrorCode, ValidationError } from '../types/errors.ts';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;
  public readonly validationErrors?: ValidationError[];

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>,
    validationErrors?: ValidationError[]
  ) {
    super(message);
    
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.validationErrors = validationErrors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(code: ErrorCode, message: string, details?: Record<string, any>): AppError {
    return new AppError(code, message, 400, true, details);
  }

  static unauthorized(message: string = 'Unauthorized access'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message: string = 'Access forbidden'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }

  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} not found`,
      404
    );
  }

  static conflict(code: ErrorCode, message: string): AppError {
    return new AppError(code, message, 409);
  }

  static validation(message: string, validationErrors: ValidationError[]): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      422,
      true,
      undefined,
      validationErrors
    );
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, false);
  }
} 