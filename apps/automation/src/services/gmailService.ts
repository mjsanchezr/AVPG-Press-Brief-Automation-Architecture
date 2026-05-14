import nodemailer from 'nodemailer';
import { BriefPayload, SmtpCredentials, DistributionConfig } from '../../../../shared/types';

/**
 * Enhanced Gmail Service
 * Now supports both structured BriefPayload and raw Markdown strings from the AI agent.
 */
export async function sendBriefEmailDynamically(
  payload: BriefPayload | string, 
  auth: SmtpCredentials, 
  config: DistributionConfig
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: auth.senderEmail,
        pass: auth.appPassword
      }
    });

    let htmlBody = '';
    let subject = '';

    if (typeof payload === 'string') {
      // Handle raw Markdown from Gemini
      subject = payload.split('\n')[0].replace(/[#*]/g, '').trim() || "AVPG Live Brief Update";
      
      // Simple conversion of Markdown to clean HTML for the email
      // We wrap it in a professional container with Inter font
      const formattedText = payload
        .replace(/^# (.*$)/gim, '<h1 style="font-size: 20px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size: 16px; font-weight: 600; color: #111827; text-transform: uppercase; margin-top: 24px; margin-bottom: 12px;">$1</h2>')
        .replace(/^\* (.*$)/gim, '<li style="margin-bottom: 8px;">$1</li>')
        .replace(/^📌 (.*$)/gim, '<div style="margin-bottom: 15px; font-size: 14px;"><strong>📌 $1</strong></div>')
        .replace(/^🔗 (.*$)/gim, '<div style="margin-bottom: 20px; font-size: 13px; color: #2563eb;">🔗 $1</div>')
        .replace(/\n/g, '<br>');

      htmlBody = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #111827; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            ${formattedText}
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            Sent via AVPG Press Brief Automation Architecture • ${new Date().toLocaleDateString()}
          </div>
        </div>
      `;
    } else {
      // Legacy structured payload support
      subject = payload.titleBlock;
      htmlBody = `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #111827; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h1 style="font-size: 20px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
              ${payload.titleBlock}
            </h1>
            <p style="font-size: 14px; font-weight: 500; color: #4b5563; margin-bottom: 30px;">
              ${payload.titularDelDia}
            </p>
            <!-- ... existing fields ... -->
            <div style="font-size: 14px;">${JSON.stringify(payload, null, 2)}</div>
          </div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: auth.senderEmail,
      to: config.recipientEmail,
      subject: subject,
      html: htmlBody,
    });

    return true;
  } catch (error) {
    console.error("SMTP Dispatch Error:", error);
    throw error;
  }
}
