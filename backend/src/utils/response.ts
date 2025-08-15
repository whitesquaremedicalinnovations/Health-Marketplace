import { Response } from 'express';
import { ApiSuccessResponse, ApiResponse } from '../types/errors.ts';

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: {
      total?: number;
      page?: number;
      limit?: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    }
  ): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      message,
      meta
    };

    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, 201);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): void {
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
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 