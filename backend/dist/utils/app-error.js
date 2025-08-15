import { ErrorCode } from "../types/errors.js";
export class AppError extends Error {
    statusCode;
    code;
    isOperational;
    details;
    validationErrors;
    constructor(code, message, statusCode = 500, isOperational = true, details, validationErrors) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        this.validationErrors = validationErrors;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(code, message, details) {
        return new AppError(code, message, 400, true, details);
    }
    static unauthorized(message = 'Unauthorized access') {
        return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
    }
    static forbidden(message = 'Access forbidden') {
        return new AppError(ErrorCode.FORBIDDEN, message, 403);
    }
    static notFound(resource = 'Resource') {
        return new AppError(ErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`, 404);
    }
    static conflict(code, message) {
        return new AppError(code, message, 409);
    }
    static validation(message, validationErrors) {
        return new AppError(ErrorCode.VALIDATION_ERROR, message, 422, true, undefined, validationErrors);
    }
    static internal(message = 'Internal server error') {
        return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, false);
    }
}
