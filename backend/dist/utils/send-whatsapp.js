import twilio from 'twilio';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Twilio sandbox number
let twilioClient = null;
if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
}
else {
    console.warn('⚠️ Twilio credentials not configured, WhatsApp notifications will be skipped');
}
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // If it doesn't start with +, add country code (default to +1 for US/Canada)
    if (!phone.startsWith('+')) {
        // If it starts with 1 and is 11 digits, add +
        if (cleaned.startsWith('1') && cleaned.length === 11) {
            cleaned = '+' + cleaned;
        }
        else if (cleaned.length === 10) {
            // Assume US number, add +1
            cleaned = '+1' + cleaned;
        }
        else {
            // Add + if missing
            cleaned = '+' + cleaned;
        }
    }
    else {
        cleaned = phone;
    }
    // Convert to WhatsApp format
    if (!cleaned.startsWith('whatsapp:')) {
        cleaned = 'whatsapp:' + cleaned;
    }
    return cleaned;
}
export async function sendWhatsAppNotification({ to, message }) {
    try {
        if (!twilioClient) {
            console.warn('⚠️ Twilio client not configured, skipping WhatsApp notification');
            return { success: false, error: 'WhatsApp service not configured' };
        }
        const formattedTo = formatPhoneNumber(to);
        const result = await twilioClient.messages.create({
            from: whatsappFrom,
            to: formattedTo,
            body: message,
        });
        console.log('✅ WhatsApp message sent successfully:', result.sid);
        return { success: true, messageSid: result.sid };
    }
    catch (error) {
        console.error('❌ Failed to send WhatsApp message:', error.message || error);
        return { success: false, error: error.message || error };
    }
}
export async function sendBulkWhatsAppNotifications(notifications) {
    try {
        if (!twilioClient) {
            console.warn('⚠️ Twilio client not configured, skipping bulk WhatsApp notifications');
            return { success: false, error: 'WhatsApp service not configured' };
        }
        const results = await Promise.allSettled(notifications.map(notification => sendWhatsAppNotification(notification)));
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;
        console.log(`✅ Bulk WhatsApp notifications: ${successful} sent, ${failed} failed`);
        return { success: true, sent: successful, failed };
    }
    catch (error) {
        console.error('❌ Failed to send bulk WhatsApp notifications:', error);
        return { success: false, error };
    }
}
