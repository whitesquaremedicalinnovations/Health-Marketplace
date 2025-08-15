export class ResponseHelper {
    static success(res, data, message, statusCode = 200, meta) {
        const response = {
            success: true,
            data,
            message,
            meta
        };
        res.status(statusCode).json(response);
    }
    static created(res, data, message) {
        this.success(res, data, message, 201);
    }
    static paginated(res, data, total, page, limit, message) {
        const hasNext = page * limit < total;
        const hasPrev = page > 1;
        this.success(res, data, message, 200, {
            total,
            page,
            limit,
            hasNext,
            hasPrev
        });
    }
}
// Async handler wrapper to catch errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
