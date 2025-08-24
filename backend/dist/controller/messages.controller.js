import { prisma } from "../utils/prisma.js";
import { asyncHandler } from "../utils/response.js";
import { ResponseHelper } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";
import { ErrorCode } from "../types/errors.js";
export const getMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Chat ID is required", 400);
    }
    // Verify chat exists
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { id: true }
    });
    if (!chat) {
        throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Chat not found", 404);
    }
    const messages = await prisma.message.findMany({
        where: { chatId },
        include: {
            senderDoctor: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true
                }
            },
            senderClinic: {
                select: {
                    id: true,
                    clinicName: true
                }
            },
            attachments: true
        },
        orderBy: { createdAt: 'asc' },
    });
    const totalMessages = await prisma.message.count({
        where: { chatId }
    });
    const response = {
        messages
    };
    ResponseHelper.success(res, response, "Messages retrieved successfully");
});
export const getMessagesByPatient = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    if (!patientId) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, "Patient ID is required", 400);
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    // Find chat for this patient
    const chat = await prisma.chat.findFirst({
        where: { patientId },
        select: { id: true }
    });
    if (!chat) {
        throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "No chat found for this patient", 404);
    }
    const messages = await prisma.message.findMany({
        where: { chatId: chat.id },
        include: {
            senderDoctor: {
                select: {
                    id: true,
                    fullName: true,
                    specialization: true
                }
            },
            senderClinic: {
                select: {
                    id: true,
                    clinicName: true
                }
            }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limitNum
    });
    const totalMessages = await prisma.message.count({
        where: { chatId: chat.id }
    });
    const response = {
        messages,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalMessages,
            totalPages: Math.ceil(totalMessages / limitNum),
            hasNext: pageNum < Math.ceil(totalMessages / limitNum),
            hasPrev: pageNum > 1
        }
    };
    ResponseHelper.success(res, response, "Messages retrieved successfully");
});
