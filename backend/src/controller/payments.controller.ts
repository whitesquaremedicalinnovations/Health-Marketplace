import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.ts";
import { ResponseHelper, asyncHandler } from "../utils/response.ts";
import { AppError } from "../utils/app-error.ts";
import { ErrorCode } from "../types/errors.ts";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const handlePayment = asyncHandler(async (request: Request, response: Response) => {
    const { amount, currency, receipt, email, userType } = await request.body;

    const options = {
        amount: amount * 100,
        currency: currency,
        receipt: receipt,
        notes: {
            email: email,
            userType: userType,
        },
    }

    try {
        const order = await razorpay.orders.create(options);
        return ResponseHelper.success(response, order, "Order created successfully ");
    } catch (error) {
        console.error(error);
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create order");
    }
})

export const verifyPayment = asyncHandler(async (request: Request, response: Response) => {
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = await request.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string).update(body).digest('hex');

    if(razorpay_signature === expectedSignature) {
        return ResponseHelper.success(response, { message: "Payment verified" }, "Payment verified" );
    } else {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, "Payment verification failed");
    }
})


export const getEmailPayment = asyncHandler(async (request: Request, response: Response) => {
    const { email, userType } = request.query;
    try{

        const payment = await prisma.payment.findFirst({
            where: {
                email: email as string,
                userType: userType as string,
            },
        });
        return ResponseHelper.success(response, { payment }, "Payment fetched successfully");
    }catch(error){
        console.error(error);
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to fetch payment");
    }
})