import { Router } from "express";
import { getMessages, getMessagesByPatient } from "../controller/messages.controller.js";
const router = Router();
// Get messages by chat ID
router.get("/chat/:chatId", getMessages);
// Get messages by patient ID (finds the chat first)
router.get("/patient/:patientId", getMessagesByPatient);
export default router;
