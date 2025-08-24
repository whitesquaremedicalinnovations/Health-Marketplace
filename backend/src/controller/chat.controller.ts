import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import { asyncHandler } from "../utils/response.ts";
import { ResponseHelper } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";

// We'll get the io instance from the request object (set by middleware)
let ioInstance: any = null;

export const setSocketInstance = (io: any) => {
  ioInstance = io;
};

export const getOrCreateChat = asyncHandler(async (req: Request, res: Response) => {
  const { patientId, doctorId, clinicId } = req.body;
  console.log("patientId", patientId);
  console.log("doctorId", doctorId);
  console.log("clinicId", clinicId);

  if (!doctorId || !clinicId || !patientId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Doctor ID, Clinic ID, and Patient ID are required", 400);
  }

  // Verify patient exists and belongs to the clinic
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId: clinicId
    },
    include: {
      assignedDoctors: {
        where: { id: doctorId }
      }
    }
  });

  if (!patient) {
    throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Patient not found or doesn't belong to this clinic", 404);
  }

  if (patient.assignedDoctors.length === 0) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Doctor is not assigned to this patient", 400);
  }

  // Check if chat already exists for this patient with both participants
  const existingChat = await prisma.chat.findFirst({
    where: {
      patientId,
      participants: {
        some: { clinicId }
      },
      AND: {
        participants: {
          some: { doctorId }
        }
      }
    },
    include: { 
      participants: {
        include: {
          clinic: {
            select: {
              id: true,
              clinicName: true,
              clinicAddress: true
            }
          },
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialization: true
            }
          }
        }
      },
      patient: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          status: true
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    }
  });

  if (existingChat) {
    return ResponseHelper.success(res, existingChat, "Chat retrieved successfully");
  }

  // Create new chat
  const newChat = await prisma.chat.create({
    data: {
      patientId,
      participants: {
        create: [
          { clinicId },
          { doctorId }
        ]
      }
    },
    include: {
      participants: {
        include: {
          clinic: {
            select: {
              id: true,
              clinicName: true,
              clinicAddress: true
            }
          },
          doctor: {
            select: {
              id: true,
              fullName: true,
              specialization: true
            }
          }
        }
      },
      patient: {
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          status: true
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    }
  });

  ResponseHelper.success(res, newChat, "Chat created successfully", 201);
});

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
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
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  });

  const totalMessages = await prisma.message.count({
    where: { chatId }
  });

  const response = {
    messages: messages.reverse(), // Reverse to show oldest first
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

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { chatId, content, senderId, senderType, attachments } = req.body;

  if (!chatId || !content || !senderId || !senderType) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Chat ID, content, sender ID, and sender type are required", 400);
  }

  if (!['doctor', 'clinic'].includes(senderType)) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Sender type must be 'doctor' or 'clinic'", 400);
  }

  // Verify chat exists and sender is a participant
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participants: {
        some: senderType === 'doctor' 
          ? { doctorId: senderId }
          : { clinicId: senderId }
      }
    }
  });

  if (!chat) {
    throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Chat not found or sender is not a participant", 404);
  }

  // Create message
  try{
    const message = await prisma.message.create({
      data: {
      content,
      chatId,
      ...(senderType === 'doctor' 
        ? { senderDoctorId: senderId }
        : { senderClinicId: senderId }
      ),
      attachments: {
        create: attachments.map((attachment:{filename:string, url:string, type:string}) => ({
          filename: attachment.filename,
          url: attachment.url,
          type: attachment.type
        }))
      }
    },
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
    }
    });
    console.log("sent message", message)
 
    // Update chat's last message timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() }
    });

    // Emit Socket.IO event for real-time messaging
    if (ioInstance) {
      console.log(`📡 Emitting Socket.IO event for chat ${chatId}`);
      ioInstance.to(chatId).emit("receive_message", message);
    } else {
      console.warn("⚠️ Socket.IO instance not available for real-time messaging");
    }

    ResponseHelper.success(res, message, "Message sent successfully", 201);
  }catch(error){
    console.log("error", error);
    throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to send message", 500);
  }
});

export const markMessageAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { readerId } = req.body;

  if (!messageId || !readerId) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Message ID and reader ID are required", 400);
  }

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { chat: { include: { participants: true } } }
  });

  if (!message) {
    throw new AppError(ErrorCode.RESOURCE_NOT_FOUND, "Message not found", 404);
  }

  // Verify reader is a participant in the chat
  const isParticipant = message.chat.participants.some(p => 
    p.doctorId === readerId || p.clinicId === readerId
  );

  if (!isParticipant) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Reader is not a participant in this chat", 400);
  }

  // Don't mark own messages as read
  if (message.senderDoctorId === readerId || message.senderClinicId === readerId) {
    return ResponseHelper.success(res, message, "Cannot mark own message as read");
  }

  // For now, just return the message since readAt/status fields don't exist yet
  const updatedMessage = await prisma.message.findUnique({
    where: { id: messageId },
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
    }
  });

  ResponseHelper.success(res, updatedMessage, "Message marked as read");
});
  