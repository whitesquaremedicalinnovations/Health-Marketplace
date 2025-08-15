import { Router } from "express";
import { getOrCreateChat, getChatMessages, sendMessage, markMessageAsRead } from "../controller/chat.controller.js";
const router = Router();
router.post("/get-or-create-chat", getOrCreateChat);
router.get("/messages/:chatId", getChatMessages);
router.post("/send-message", sendMessage);
router.patch("/messages/:messageId/read", markMessageAsRead);
export default router;
