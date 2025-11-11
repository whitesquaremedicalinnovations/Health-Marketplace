import { sendEmailNotification } from "./send-email.js";
import { sendWhatsAppNotification } from "./send-whatsapp.js";
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
    try {
        const message = {
            to: expoPushToken,
            sound: "default",
            title,
            body,
            data,
        };
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        const result = await response.json();
        console.log('✅ Push notification sent:', result);
        return { success: true, result };
    }
    catch (error) {
        console.error('❌ Failed to send push notification:', error);
        return { success: false, error };
    }
}
export async function sendBulkPushNotification(expoPushTokens, title, body, data = {}) {
    try {
        const messages = expoPushTokens.map((token) => ({
            to: token,
            sound: "default",
            title,
            body,
            data,
        }));
        const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messages),
        });
        const result = await response.json();
        console.log('✅ Bulk push notifications sent:', result);
        return { success: true, result };
    }
    catch (error) {
        console.error('❌ Failed to send bulk push notifications:', error);
        return { success: false, error };
    }
}
/**
 * Send notification via all available channels (Push, Email, WhatsApp)
 * @param recipient - Object containing email, phoneNumber, and/or notificationToken
 * @param title - Notification title
 * @param body - Notification body/content
 * @param data - Additional data for push notifications
 */
export async function sendMultiChannelNotification(recipient, title, body, data = {}) {
    const results = {
        push: { success: false },
        email: { success: false },
        whatsapp: { success: false },
    };
    // Send push notification if token exists
    if (recipient.notificationToken) {
        try {
            const pushResult = await sendPushNotification(recipient.notificationToken, title, body, data);
            results.push = pushResult;
        }
        catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
    // Send email notification if email exists
    if (recipient.email) {
        try {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">${title}</h2>
                    <p style="color: #666; line-height: 1.6;">${body}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">This is an automated notification from DentalIcons.</p>
                </div>
            `;
            const emailResult = await sendEmailNotification({
                to: recipient.email,
                subject: title,
                html: emailHtml,
            });
            results.email = emailResult;
        }
        catch (error) {
            console.error('Error sending email notification:', error);
        }
    }
    // Send WhatsApp notification if phone number exists
    if (recipient.phoneNumber) {
        try {
            const whatsappMessage = `${title}\n\n${body}`;
            const whatsappResult = await sendWhatsAppNotification({
                to: recipient.phoneNumber,
                message: whatsappMessage,
            });
            results.whatsapp = whatsappResult;
        }
        catch (error) {
            console.error('Error sending WhatsApp notification:', error);
        }
    }
    return results;
}
/**
 * Send bulk notifications via all available channels
 * @param recipients - Array of recipient objects
 * @param title - Notification title
 * @param body - Notification body/content
 * @param data - Additional data for push notifications
 */
export async function sendBulkMultiChannelNotification(recipients, title, body, data = {}) {
    const pushTokens = [];
    const emailNotifications = [];
    const whatsappNotifications = [];
    // Collect all notification channels
    recipients.forEach(recipient => {
        if (recipient.notificationToken) {
            pushTokens.push(recipient.notificationToken);
        }
        if (recipient.email) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">${title}</h2>
                    <p style="color: #666; line-height: 1.6;">${body}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">This is an automated notification from DentalIcons.</p>
                </div>
            `;
            emailNotifications.push({
                to: recipient.email,
                subject: title,
                html: emailHtml,
            });
        }
        if (recipient.phoneNumber) {
            whatsappNotifications.push({
                to: recipient.phoneNumber,
                message: `${title}\n\n${body}`,
            });
        }
    });
    const results = {
        push: { success: false },
        email: { success: false },
        whatsapp: { success: false },
    };
    // Send all notifications in parallel
    const promises = [];
    if (pushTokens.length > 0) {
        promises.push(sendBulkPushNotification(pushTokens, title, body, data)
            .then(result => { results.push = result; })
            .catch(error => console.error('Error sending bulk push notifications:', error)));
    }
    if (emailNotifications.length > 0) {
        promises.push(Promise.allSettled(emailNotifications.map(email => sendEmailNotification(email)))
            .then(() => { results.email = { success: true }; })
            .catch(error => console.error('Error sending bulk email notifications:', error)));
    }
    if (whatsappNotifications.length > 0) {
        promises.push(Promise.allSettled(whatsappNotifications.map(whatsapp => sendWhatsAppNotification(whatsapp)))
            .then(() => { results.whatsapp = { success: true }; })
            .catch(error => console.error('Error sending bulk WhatsApp notifications:', error)));
    }
    await Promise.allSettled(promises);
    return results;
}
