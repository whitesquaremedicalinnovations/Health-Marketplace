import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotificationParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmailNotification({ to, subject, html }: EmailNotificationParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping email notification');
      return { success: false, error: 'Email service not configured' };
    }

    const data = await resend.emails.send({
      from: 'DentalIcons <noreply@techmorphers.com>',
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendBulkEmailNotifications(emails: EmailNotificationParams[]) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured, skipping bulk email notifications');
      return { success: false, error: 'Email service not configured' };
    }

    const results = await Promise.allSettled(
      emails.map(email => sendEmailNotification(email))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`✅ Bulk email notifications: ${successful} sent, ${failed} failed`);
    return { success: true, sent: successful, failed };
  } catch (error) {
    console.error('❌ Failed to send bulk email notifications:', error);
    return { success: false, error };
  }
}

