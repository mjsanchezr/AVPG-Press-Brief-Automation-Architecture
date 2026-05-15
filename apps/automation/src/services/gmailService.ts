import nodemailer from 'nodemailer';
import { marked } from 'marked';

interface EmailParams {
  senderEmail: string;
  appPassword: string;
  recipientEmail: string;
  markdown: string;
  pdfBuffer: Buffer | null;
}

/**
 * Service to dispatch the intelligence brief via Gmail SMTP.
 */
export async function sendBriefEmail({
  senderEmail,
  appPassword,
  recipientEmail,
  markdown,
  pdfBuffer
}: EmailParams): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: appPassword
    }
  });

  const htmlBody = await marked.parse(markdown);

  const mailOptions: nodemailer.SendMailOptions = {
    from: `"AVPG Intelligence" <${senderEmail}>`,
    to: recipientEmail,
    subject: `🛢️ AVPG RESUMEN DE PRENSA — 15 DE MAYO DE 2026`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #1B4B8A;">AVPG Intelligence Brief</h2>
        <p>Adjunto encontrará el resumen de prensa correspondiente al 15 de mayo de 2026.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <div class="markdown-content">
          ${htmlBody}
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 10px; color: #888;">
          Este mensaje fue generado automáticamente por el AVPG Intelligence Loop.
        </p>
      </div>
    `,
    attachments: pdfBuffer ? [
      {
        filename: `AVPG_Resumen_Prensa_2026_05_15.pdf`,
        content: pdfBuffer
      }
    ] : []
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] Email sent to ${recipientEmail}`);
  } catch (error: any) {
    console.error("Nodemailer Dispatch Error:", error);
    throw new Error(`Email Dispatch Failed: ${error.message}`);
  }
}
