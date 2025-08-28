import { prisma } from "./prisma.ts";
import { AppError } from "./app-error.ts";
import { ErrorCode } from "../types/errors.ts";
import bcrypt from "bcrypt";

export interface CreateAdminData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'super_admin';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new admin user with hashed password
 * @param adminData - Admin user data
 * @returns Created admin user (without password)
 */
export const createAdminUser = async (adminData: CreateAdminData): Promise<AdminUser> => {
  try {
    // Check if admin with email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      throw AppError.conflict(ErrorCode.RESOURCE_ALREADY_EXISTS, "Admin with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role || 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("Failed to create admin user");
  }
};

/**
 * Validates admin credentials and returns admin data
 * @param email - Admin email
 * @param password - Admin password
 * @returns Admin user data if credentials are valid
 */
export const validateAdminCredentials = async (email: string, password: string): Promise<AdminUser> => {
  try {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw AppError.unauthorized("Invalid admin credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid admin credentials");
    }

    // Return admin data without password
    const { password: _, ...adminData } = admin;
    return adminData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("Failed to validate admin credentials");
  }
};

/**
 * Gets all admin users (without passwords)
 * @returns Array of admin users
 */
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return admins;
  } catch (error) {
    throw AppError.internal("Failed to retrieve admin users");
  }
};

/**
 * Updates admin user data
 * @param adminId - Admin user ID
 * @param updateData - Data to update
 * @returns Updated admin user
 */
export const updateAdminUser = async (
  adminId: string,
  updateData: Partial<Pick<CreateAdminData, 'name' | 'role'>>
): Promise<AdminUser> => {
  try {
    const admin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  } catch (error) {
    throw AppError.internal("Failed to update admin user");
  }
};

/**
 * Changes admin password
 * @param adminId - Admin user ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success message
 */
export const changeAdminPassword = async (
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    // Get admin with password
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { password: true },
    });

    if (!admin) {
      throw AppError.notFound("Admin user not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      throw AppError.unauthorized("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedNewPassword },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("Failed to change admin password");
  }
};

/**
 * Deletes admin user
 * @param adminId - Admin user ID
 * @returns Success message
 */
export const deleteAdminUser = async (adminId: string): Promise<void> => {
  try {
    await prisma.admin.delete({
      where: { id: adminId },
    });
  } catch (error) {
    throw AppError.internal("Failed to delete admin user");
  }
}; 