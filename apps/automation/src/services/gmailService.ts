import nodemailer from 'nodemailer';
import { marked } from 'marked';
import { SmtpCredentials, DistributionConfig } from '../../../../shared/types';

export interface MailOptions {
  markdown: string;
  pdfBuffer: Buffer;
  date: string;
  config: {
    smtpUser: string;
    smtpPass: string;
    recipientEmail: string;
  };
}

export class GmailService {
  async sendBrief(options: MailOptions, log: (msg: string) => void): Promise<void> {
    const { markdown, pdfBuffer, date, config } = options;
    
    log(`Configuring SMTP Transport for ${config.smtpUser}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    });

    const fileName = `AVPG_Resumen_Prensa_2026_05_15.pdf`;
    const htmlFallback = await marked(markdown);

    const mailOptions = {
      from: `"AVPG Automation" <${config.smtpUser}>`,
      to: config.recipientEmail,
      subject: `🛢️ AVPG RESUMEN DE PRENSA — 15 DE MAYO DE 2026`,
      html: `
        <div style="font-family: Helvetica, Arial, sans-serif; color: #333;">
          <h1 style="color: #1B4B8A;">AVPG Intelligence Brief</h1>
          <p>Please find attached the high-fidelity PDF report for <strong>May 15, 2026</strong>.</p>
          <hr/>
          <div class="brief-content">
            ${htmlFallback}
          </div>
          <footer style="margin-top: 20px; font-size: 12px; color: #999;">
            Automated via AVPG Cloud Run Architecture.
          </footer>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      log('Dispatching Email via SMTP');
      await transporter.sendMail(mailOptions);
      log('Email dispatched successfully');
    } catch (error: any) {
      log(`SMTP Dispatch Error: ${error.message}`);
      // Fallback: Try sending without attachment if it failed due to size or other PDF issues
      log('Attempting fallback: Sending high-density HTML body only');
      await transporter.sendMail({
        ...mailOptions,
        attachments: [],
        subject: mailOptions.subject + ' (HTML Fallback)'
      });
      log('Fallback email dispatched successfully');
    }
  }
}

export const gmailService = new GmailService();

export async function sendBriefEmailDynamically(
  payload: string, 
  auth: SmtpCredentials, 
  config: DistributionConfig
): Promise<boolean> {
  try {
    await gmailService.sendBrief({
      markdown: payload,
      pdfBuffer: Buffer.alloc(0), // Dummy buffer for now if PDF is not required or handled elsewhere
      date: '2026-05-15',
      config: {
        smtpUser: auth.senderEmail,
        smtpPass: auth.appPassword,
        recipientEmail: config.recipientEmail
      }
    }, (msg) => console.log(`[GmailService] ${msg}`));
    return true;
  } catch (error) {
    console.error("[GmailService] sendBriefEmailDynamically failed:", error);
    return false;
  }
}
