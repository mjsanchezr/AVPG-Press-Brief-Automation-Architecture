import nodemailer from 'nodemailer';
import { BriefPayload, SmtpCredentials, DistributionConfig } from '../../../../shared/types';
import { generateBriefPDF } from './pdfService';

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

    // Generate the high-fidelity PDF
    const markdown = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const pdfBuffer = await generateBriefPDF(markdown);
    const fileName = `AVPG_Resumen_Prensa_2026_05_15.pdf`;

    const executiveSummary = `
      <div style="font-family: 'Helvetica', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #1B4B8A; padding: 24px; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">AVPG Resumen de Prensa</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 14px;">Viernes, 15 de mayo de 2026</p>
        </div>
        <div style="padding: 32px; background-color: white;">
          <h2 style="color: #1B4B8A; margin-top: 0; font-size: 18px;">Executive Summary</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 15px;">
            The latest market intelligence and macroeconomic analysis for the Venezuela-Trinidad energy corridor has been synthesized.
          </p>
          <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1B4B8A;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">📎 Full Report Attached</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Filename: ${fileName}</p>
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin-bottom: 0;">
            Grounded Intelligence Delivery via Gemini 2.5 Flash.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: auth.senderEmail,
      to: config.recipientEmail,
      subject: `AVPG Resumen de Prensa - 15 de mayo de 2026`,
      html: executiveSummary,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    return true;
  } catch (error) {
    console.error("SMTP Dispatch Error:", error);
    throw error;
  }
}
