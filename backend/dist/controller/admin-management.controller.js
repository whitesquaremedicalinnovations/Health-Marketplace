import { prisma } from "../utils/prisma.js";
import { asyncHandler, ResponseHelper } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";
import { createAdminUser, getAllAdmins, updateAdminUser, changeAdminPassword, deleteAdminUser } from "../utils/admin-helper.js";
import { ErrorCode } from "../types/errors.js";
// Create a new admin user (super admin only)
export const createAdmin = asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "Email, password, and name are required");
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "Invalid email format");
    }
    // Validate password strength
    if (password.length < 8) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "Password must be at least 8 characters long");
    }
    const adminData = {
        email,
        password,
        name,
        role: role || 'admin',
    };
    const newAdmin = await createAdminUser(adminData);
    ResponseHelper.success(res, { admin: newAdmin }, "Admin user created successfully");
});
// Get all admin users
export const getAdmins = asyncHandler(async (req, res) => {
    const admins = await getAllAdmins();
    ResponseHelper.success(res, { admins }, "Admin users retrieved successfully");
});
// Update admin user
export const updateAdmin = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const { name, role } = req.body;
    if (!name && !role) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "At least one field (name or role) is required");
    }
    const updateData = {};
    if (name)
        updateData.name = name;
    if (role)
        updateData.role = role;
    const updatedAdmin = await updateAdminUser(adminId, updateData);
    ResponseHelper.success(res, { admin: updatedAdmin }, "Admin user updated successfully");
});
// Change admin password
export const changePassword = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "Current password and new password are required");
    }
    // Validate new password strength
    if (newPassword.length < 8) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "New password must be at least 8 characters long");
    }
    await changeAdminPassword(adminId, currentPassword, newPassword);
    ResponseHelper.success(res, null, "Password changed successfully");
});
// Delete admin user
export const deleteAdmin = asyncHandler(async (req, res) => {
    const { adminId } = req.params;
    await deleteAdminUser(adminId);
    ResponseHelper.success(res, null, "Admin user deleted successfully");
});
// Get admin user by ID
export const getAdminById = asyncHandler(async (req, res) => {
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
