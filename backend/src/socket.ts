import { Server, Socket } from "socket.io";
import { prisma } from "./utils/prisma.ts";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected");

    socket.on("join_chat", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on("leave_chat", (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`User left chat: ${chatId}`);
    });

    socket.on("send_message", async (data) => {
      const { chatId, content, senderId, senderType } = data;
      if (!chatId || !content || !senderId || !senderType) {
        return socket.emit("error", {
          message: "Chat ID, content, sender ID, and sender type are required",
        });
      }

      if (!["doctor", "clinic"].includes(senderType)) {
        return socket.emit("error", {
          message: "Sender type must be 'doctor' or 'clinic'",
        });
      }

      try {
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            participants: {
              some:
                senderType === "doctor"
                  ? { doctorId: senderId }
                  : { clinicId: senderId },
            },
          },
        });

        if (!chat) {
          return socket.emit("error", {
            message: "Chat not found or sender is not a participant",
          });
        }

        const newMessage = await prisma.message.create({
          data: {
            content,
            chatId,
            ...(senderType === "doctor"
              ? { senderDoctorId: senderId }
              : { senderClinicId: senderId }),
          },
          include: {
            senderDoctor: {
              select: { id: true, fullName: true, specialization: true },
            },
            senderClinic: {
              select: { id: true, clinicName: true },
            },
          },
        });

        await prisma.chat.update({
          where: { id: chatId },
          data: { lastMessageAt: new Date() },
        });

        io.to(chatId).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Error in sending message", err);
        socket.emit("error", { message: "Internal Server Error" });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
