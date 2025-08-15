import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.ts';
import { ApiErrorResponse, ErrorCode } from '../types/errors.ts';
import { logger } from '../utils/logger.ts';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Convert Prisma errors to AppError
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err as any);
  }

  // If it's not an AppError, create one
  if (!(error instanceof AppError)) {
    error = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Something went wrong',
      500,
      false
    );
  }

  const appError = error as AppError;

  // Log error details
  logger.error(
    `Error occurred: ${appError.message}`,
    err,
    {
      userId: req.body.userId || req.params.userId,
      method: req.method,
      url: req.originalUrl,
      statusCode: appError.statusCode,
      errorCode: appError.code
    }
  );

  // Create error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      validationErrors: appError.validationErrors,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  };

  // Don't expose internal errors in production
  if (!appError.isOperational && process.env.NODE_ENV === 'production') {
    errorResponse.error.message = 'Internal server error';
    delete errorResponse.error.details;
  }

  res.status(appError.statusCode).json(errorResponse);
};

function handlePrismaError(err: any): AppError {
  switch (err.code) {
    case 'P2002':
      return AppError.conflict(
        ErrorCode.RESOURCE_ALREADY_EXISTS,
        `Resource already exists. Constraint: ${err.meta?.target?.join(', ')}`
      );
    case 'P2025':
      return AppError.notFound('Resource');
    case 'P2003':
      return AppError.badRequest(
        ErrorCode.VALIDATION_ERROR,
        'Foreign key constraint failed'
      );
    default:
      return AppError.internal('Database operation failed');
  }
}

// Catch unhandled promise rejections
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', reason instanceof Error ? reason : new Error(String(reason)));
    process.exit(1);
  });
}; 