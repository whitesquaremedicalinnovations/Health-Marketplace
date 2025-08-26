import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import { asyncHandler, ResponseHelper } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { 
  createAdminUser, 
  validateAdminCredentials, 
  getAllAdmins, 
  updateAdminUser, 
  changeAdminPassword, 
  deleteAdminUser,
  type CreateAdminData 
} from "../utils/admin-helper.ts";

// Create a new admin user (super admin only)
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    throw AppError.badRequest("Email, password, and name are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw AppError.badRequest("Invalid email format");
  }

  // Validate password strength
  if (password.length < 8) {
    throw AppError.badRequest("Password must be at least 8 characters long");
  }

  const adminData: CreateAdminData = {
    email,
    password,
    name,
    role: role || 'admin',
  };

  const newAdmin = await createAdminUser(adminData);

  ResponseHelper.success(res, { admin: newAdmin }, "Admin user created successfully");
});

// Get all admin users
export const getAdmins = asyncHandler(async (req: Request, res: Response) => {
  const admins = await getAllAdmins();
  ResponseHelper.success(res, { admins }, "Admin users retrieved successfully");
});

// Update admin user
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { name, role } = req.body;

  if (!name && !role) {
    throw AppError.badRequest("At least one field (name or role) is required");
  }

  const updateData: Partial<{ name: string; role: string }> = {};
  if (name) updateData.name = name;
  if (role) updateData.role = role;

  const updatedAdmin = await updateAdminUser(adminId, updateData);

  ResponseHelper.success(res, { admin: updatedAdmin }, "Admin user updated successfully");
});

// Change admin password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw AppError.badRequest("Current password and new password are required");
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    throw AppError.badRequest("New password must be at least 8 characters long");
  }

  await changeAdminPassword(adminId, currentPassword, newPassword);

  ResponseHelper.success(res, null, "Password changed successfully");
});

// Delete admin user
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  await deleteAdminUser(adminId);

  ResponseHelper.success(res, null, "Admin user deleted successfully");
});

// Get admin user by ID
export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const { adminId } = req.params;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    throw AppError.notFound("Admin user not found");
  }

  ResponseHelper.success(res, { admin }, "Admin user retrieved successfully");
}); 