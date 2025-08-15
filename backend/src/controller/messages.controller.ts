import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import { asyncHandler } from "../utils/response.ts";
import { ResponseHelper } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!chatId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Chat ID is required", 400);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

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
    skip,
    take: limitNum
  });

  const totalMessages = await prisma.message.count({
    where: { chatId }
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

export const getMessagesByPatient = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!patientId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Patient ID is required", 400);
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
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