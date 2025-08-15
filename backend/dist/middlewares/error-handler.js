import { AppError } from "../utils/app-error.js";
import { ErrorCode } from "../types/errors.js";
import { logger } from "../utils/logger.js";
export const errorHandler = (err, req, res, next) => {
    let error = err;
    // Convert Prisma errors to AppError
    if (err.name === 'PrismaClientKnownRequestError') {
        error = handlePrismaError(err);
    }
    // If it's not an AppError, create one
    if (!(error instanceof AppError)) {
        error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'Something went wrong', 500, false);
    }
    const appError = error;
    // Log error details
    logger.error(`Error occurred: ${appError.message}`, err, {
        userId: req.body.userId || req.params.userId,
        method: req.method,
        url: req.originalUrl,
        statusCode: appError.statusCode,
        errorCode: appError.code
    });
    // Create error response
    const errorResponse = {
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
function handlePrismaError(err) {
    switch (err.code) {
        case 'P2002':
            return AppError.conflict(ErrorCode.RESOURCE_ALREADY_EXISTS, `Resource already exists. Constraint: ${err.meta?.target?.join(', ')}`);
        case 'P2025':
            return AppError.notFound('Resource');
        case 'P2003':
            return AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Foreign key constraint failed');
        default:
            return AppError.internal('Database operation failed');
    }
}
// Catch unhandled promise rejections
export const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', reason instanceof Error ? reason : new Error(String(reason)));
        process.exit(1);
    });
};
