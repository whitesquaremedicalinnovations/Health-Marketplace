import { prisma } from "../utils/prisma.js";
import { asyncHandler, ResponseHelper } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";
import { generateAccessToken } from "../utils/generate-auth-tokens.js";
import { validateAdminCredentials } from "../utils/admin-helper.js";
import { ErrorCode } from "../types/errors.js";
export const getNewsById = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    const news = await prisma.news.findUnique({ where: { id: newsId } });
    if (!news) {
        throw AppError.notFound("News");
    }
    ResponseHelper.success(res, news, "News retrieved successfully");
});
export const getOverview = asyncHandler(async (req, res) => {
    const totalDoctors = await prisma.doctor.count();
    const totalClinics = await prisma.clinic.count();
    const totalPitches = await prisma.pitch.count();
    const totalRequirements = await prisma.jobRequirement.count();
    const totalPayments = await prisma.payment.count();
    const totalAmount = await prisma.payment.aggregate({ _sum: { amount: true } });
    const totalNews = await prisma.news.count();
    const totalLikes = await prisma.newsLike.count();
    const totalComments = await prisma.newsComment.count();
    ResponseHelper.success(res, { totalDoctors, totalClinics, totalPitches, totalRequirements, totalPayments, totalAmount, totalNews, totalLikes, totalComments }, "Overview retrieved successfully");
});
export const getAllUsers = asyncHandler(async (req, res) => {
    const doctors = await prisma.doctor.findMany();
    const clinics = await prisma.clinic.findMany();
    ResponseHelper.success(res, { doctors, clinics }, "Users retrieved successfully");
});
export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await prisma.doctor.findMany();
    ResponseHelper.success(res, { doctors }, "Doctors retrieved successfully");
});
export const getAllClinics = asyncHandler(async (req, res) => {
    const clinics = await prisma.clinic.findMany();
    ResponseHelper.success(res, { clinics }, "Clinics retrieved successfully");
});
export const getAllPitches = asyncHandler(async (req, res) => {
    const pitches = await prisma.pitch.findMany();
    ResponseHelper.success(res, { pitches }, "Pitches retrieved successfully");
});
export const getAllRequirements = asyncHandler(async (req, res) => {
    const requirements = await prisma.jobRequirement.findMany();
    ResponseHelper.success(res, { requirements }, "Requirements retrieved successfully");
});
export const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({});
    ResponseHelper.success(res, { payments }, "Payments retrieved successfully");
});
export const getOnboardingFee = asyncHandler(async (req, res) => {
    const onboardingFee = await prisma.onboardingFee.findFirst();
    ResponseHelper.success(res, { onboardingFee }, "Onboarding fee retrieved successfully");
});
export const setOnboardingFee = asyncHandler(async (req, res) => {
    const { fee } = req.body;
    const onboardingFee = await prisma.onboardingFee.create({ data: { fee } });
    ResponseHelper.success(res, { onboardingFee }, "Onboarding fee set successfully");
});
export const getUsersToVerify = asyncHandler(async (req, res) => {
    const doctors = await prisma.doctor.findMany({ where: { isVerified: false } });
    const clinics = await prisma.clinic.findMany({ where: { isVerified: false } });
    ResponseHelper.success(res, { doctors, clinics }, "Users to verify retrieved successfully");
});
export const verifyDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const doctor = await prisma.doctor.update({ where: { id: doctorId }, data: { isVerified: true } });
    ResponseHelper.success(res, { doctor }, "Doctor verified successfully");
});
export const verifyClinic = asyncHandler(async (req, res) => {
    const { clinicId } = req.params;
    const clinic = await prisma.clinic.update({ where: { id: clinicId }, data: { isVerified: true } });
    ResponseHelper.success(res, { clinic }, "Clinic verified successfully");
});
export const getAllNews = asyncHandler(async (req, res) => {
    const news = await prisma.news.findMany();
    ResponseHelper.success(res, { news }, "News retrieved successfully");
});
export const createNews = asyncHandler(async (req, res) => {
    const { title, content, imageUrl, adminId } = req.body;
    const news = await prisma.news.create({ data: { title, content, imageUrl, postedById: adminId } });
    ResponseHelper.success(res, { news }, "News created successfully");
});
export const updateNews = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    const { title, content, imageUrl } = req.body;
    const news = await prisma.news.update({ where: { id: newsId }, data: { title, content, imageUrl } });
    ResponseHelper.success(res, { news }, "News updated successfully");
});
export const deleteNews = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    const news = await prisma.news.delete({ where: { id: newsId } });
    ResponseHelper.success(res, { news }, "News deleted successfully");
});
export const totalNewsLikes = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    const totalLikes = await prisma.newsLike.count({ where: { newsId } });
    ResponseHelper.success(res, { totalLikes }, "Total likes retrieved successfully");
});
export const totalNewsComments = asyncHandler(async (req, res) => {
    const { newsId } = req.params;
    const totalComments = await prisma.newsComment.count({ where: { newsId } });
    ResponseHelper.success(res, { totalComments }, "Total comments retrieved successfully");
});
// Admin Authentication
export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw AppError.badRequest(ErrorCode.INVALID_CREDENTIALS, "Email and password are required");
    }
    try {
        // Use the helper function to validate credentials
        const admin = await validateAdminCredentials(email, password);
        // Generate JWT token with admin role
        const token = generateAccessToken(admin.id, admin.role);
        ResponseHelper.success(res, {
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
            token,
        }, "Admin login successful");
    }
    catch (error) {
        // If no admin exists in database, fall back to hardcoded credentials for demo
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@healthcare.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
        const ADMIN_ID = process.env.ADMIN_ID || "admin-1";
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const token = generateAccessToken(ADMIN_ID, "admin");
            const adminData = {
                id: ADMIN_ID,
                email: ADMIN_EMAIL,
                name: "Admin User",
                role: "admin",
            };
            ResponseHelper.success(res, {
                admin: adminData,
                token,
            }, "Admin login successful");
        }
        else {
            throw AppError.unauthorized("Invalid admin credentials");
        }
    }
});
export const adminLogout = asyncHandler(async (req, res) => {
    // For JWT tokens, logout is handled client-side by removing the token
    // In production, you might want to implement token blacklisting
    ResponseHelper.success(res, null, "Admin logout successful");
});
