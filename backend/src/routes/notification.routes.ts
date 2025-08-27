import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, ResponseHelper } from "../utils/response";

const router = Router();

router.post("/save-device-notification-token", asyncHandler(async(req: Request, res: Response) => {
    const { token, type, clinicId, doctorId } = req.body;

    if (!clinicId && !doctorId) {
        return res.status(404).json({ message: "Clinic or doctor not found" });
    }

    if (type === "CLINIC") {
        await prisma.clinic.update({
            where: { id: clinicId },
            data: { notificationToken: token },
        });
    } else if (type === "DOCTOR") {
        await prisma.doctor.update({
            where: { id: doctorId },
            data: { notificationToken: token },
        });
    }

    ResponseHelper.success(res, null, "Device notification token saved successfully");
}));

export default router;