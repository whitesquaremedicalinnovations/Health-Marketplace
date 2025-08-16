//razorpay webhook
export const config = {api: {bodyParser: false}};

import type { Request, Response } from "express";
import crypto from "crypto";
import getRawBody from "raw-body";
import { prisma } from "../utils/prisma.ts";
import { asyncHandler } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";

function verifySignature(body: Buffer, signature: string, secret: string) {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return expected === signature;
}

export const webhook = asyncHandler(async (request: Request, response: Response) => {
    if (request.method !== 'POST') {
        throw AppError.badRequest(ErrorCode.INVALID_OPERATION, "Method Not Allowed");
    }
    
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const rawBody = await getRawBody(request);
    const signature = request.headers["x-razorpay-signature"];

    const isValid = verifySignature(rawBody, signature as string, secret);
    if (!isValid) {
        throw AppError.badRequest(ErrorCode.UNAUTHORIZED, "Invalid Signature");
    }

    const event = JSON.parse(rawBody.toString());
    console.log(event);

    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const amount = payment.amount;
        const currency = payment.currency;
        const { email, userType } = payment.notes;

        console.log("Hello EVery one", email, userType, payment, orderId, amount, currency)

        if (!email && !userType) {
            throw AppError.badRequest(ErrorCode.INVALID_INPUT, "Payment does not have email or userType");
        }

        await prisma.payment.create({
            data: {
                provider: "RAZORPAY",
                referenceId: orderId,
                status: "SUCCESS",
                amount: amount / 100,
                currency,
                email,
                userType,
               
            },
        });

        return response.status(200).json({
            message: "Payment captured successfully"
        });
    }

    return response.status(200).json({
        message: "Webhook received"
    });
});