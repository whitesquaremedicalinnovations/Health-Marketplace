import { Router } from "express";
import { handlePayment, verifyPayment, getEmailPayment } from "../controller/payments.controller.ts";
import { webhook } from "../controller/payements-webhook.ts";

const router = Router();

router.post("/", handlePayment)
router.post("/verify", verifyPayment)   
router.post("/webhook", webhook)
router.get("/get-email-payment", getEmailPayment)

export default router;