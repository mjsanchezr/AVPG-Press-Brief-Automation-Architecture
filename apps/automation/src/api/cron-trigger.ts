import { Request, Response } from 'express';
import { fetchRawFeeds } from '../services/aggregatorService';
import { fetchAndCurateLiveBrief } from '../services/curationService';
import { sendBriefEmailDynamically } from '../services/gmailService';
import { SmtpCredentials, DistributionConfig } from '../../../../shared/types';

export default async function handler(req: Request, res: Response) {
  try {
    console.log("[CRON] Initiating ingestion sequence...");
    const rawFeeds = await fetchRawFeeds();
    
    console.log(`[CRON] Fetched ${rawFeeds.length} items. Invoking curation engine...`);
    const briefPayload = await fetchAndCurateLiveBrief(rawFeeds);

    const targetEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const dispatchEnabled = process.env.ENABLE_EMAIL_DISPATCH === 'true';

    let emailSent = false;
    if (dispatchEnabled) {
      console.log(`[CRON] Dispatching brief to ${targetEmail}...`);
      
      const auth: SmtpCredentials = {
        senderEmail: process.env.SMTP_SENDER_EMAIL || '',
        appPassword: process.env.SMTP_APP_PASSWORD || ''
      };
      
      const config: DistributionConfig = {
        recipientEmail: targetEmail
      };
      
      if (auth.senderEmail && auth.appPassword) {
        emailSent = await sendBriefEmailDynamically(briefPayload, auth, config);
      } else {
        console.warn("[CRON] Missing SMTP API credentials in environment variables.");
      }
    } else {
      console.log("[CRON] Email dispatch operational flag is disabled.");
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      emailSent,
      data: briefPayload
    });

  } catch (error: any) {
    console.error("[CRON] Pipeline failure:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal pipeline error'
    });
  }
}
