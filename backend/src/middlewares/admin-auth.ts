import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error.ts";

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const adminAuth = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized("Admin authentication required");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw AppError.unauthorized("Admin authentication token required");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      // For admin authentication, we'll create a simple admin user structure
      // In a real application, you would verify this against an admin users table
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        throw AppError.forbidden("Admin access required");
      }

      req.admin = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      throw AppError.unauthorized("Invalid admin authentication token");
    }
  } catch (error) {
    next(error);
  }
};