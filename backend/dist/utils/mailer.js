// utils/resendClient.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendOtpEmail = async (email, otp) => {
    try {
        const data = await resend.emails.send({
            from: 'Tech Morphers <noreply@techmorphers.com>',
            to: email,
            subject: 'Your OTP Code',
            html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        });
        console.log('Email sent:', data);
        return { success: true };
    }
    catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
};
