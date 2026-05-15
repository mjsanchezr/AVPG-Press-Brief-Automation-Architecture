import nodemailer from 'nodemailer';
import { Readable } from 'stream';
import { BriefPayload, SmtpCredentials, DistributionConfig } from '../../../../shared/types';
import { generateBriefPDF } from './pdfService';
import { marked } from 'marked';

/**
 * Enhanced Gmail Service
 * Now supports both structured BriefPayload and raw Markdown strings from the AI agent.
 */
export async function sendBriefEmailDynamically(
  payload: BriefPayload | string, 
  auth: SmtpCredentials, 
  config: DistributionConfig,
  pdfBuffer?: Buffer | Readable
): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: auth.senderEmail,
        pass: auth.appPassword
      }
    });

    // Generate or use the provided PDF buffer
    const markdown = typeof payload === 'string' ? payload : JSON.stringify(payload);
    let finalPdfBuffer = pdfBuffer;
    
    // Only attempt PDF generation if not provided AND we haven't explicitly opted out (via null)
    if (finalPdfBuffer === undefined) {
      try {
        finalPdfBuffer = await generateBriefPDF(markdown);
      } catch (e) {
        console.warn("[GMAIL] PDF generation failed, proceeding with HTML-only delivery.");
      }
    }

    const fileName = `AVPG_Resumen_Prensa_2026_05_15.pdf`;

    // Convert markdown to HTML for the email body to ensure "high-density" delivery
    const briefHtml = await marked(markdown);

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
          
          ${finalPdfBuffer ? `
          <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #1B4B8A;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">📎 Full Report Attached</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Filename: ${fileName}</p>
          </div>
          ` : `
          <div style="margin: 24px 0; padding: 20px; background-color: #fff7ed; border-radius: 8px; border-left: 4px solid #f97316;">
            <p style="margin: 0; font-weight: 600; color: #9a3412;">⚠️ PDF Generation Failed</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #c2410c;">The full report is included below in high-density HTML format.</p>
          </div>
          `}

          <hr style="border: 0; border-top: 1px solid #eee; margin: 32px 0;" />
          
          <div style="color: #374151; line-height: 1.7; font-size: 14px;">
            ${briefHtml}
          </div>

          <p style="font-size: 13px; color: #9ca3af; margin-top: 32px; margin-bottom: 0;">
            Grounded Intelligence Delivery via Gemini 2.5 Flash.
          </p>
        </div>
      </div>
    `;

    const attachments = [];
    if (finalPdfBuffer) {
      attachments.push({
        filename: fileName,
        content: finalPdfBuffer as any,
        contentType: 'application/pdf'
      });
    }

    await transporter.sendMail({
      from: auth.senderEmail,
      to: config.recipientEmail,
      subject: `AVPG Resumen de Prensa - 15 de mayo de 2026 ${!finalPdfBuffer ? '(HTML Edition)' : ''}`,
      html: executiveSummary,
      attachments
    });

    return true;
  } catch (error) {
    console.error("SMTP Dispatch Error:", error);
    throw error;
  }
}
