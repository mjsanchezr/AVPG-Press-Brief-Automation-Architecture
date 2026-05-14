import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRawFeeds } from '../services/aggregatorService';
import { processBriefEngine } from '../services/curationService';
import { sendBriefEmailDynamically } from '../services/gmailService';
import { GoogleApiCredentials, DistributionConfig } from '../../../../shared/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log("[CRON] Initiating ingestion sequence...");
    const rawFeeds = await fetchRawFeeds();
    
    console.log(`[CRON] Fetched ${rawFeeds.length} items. Invoking curation engine...`);
    const briefPayload = await processBriefEngine(rawFeeds);

    const targetEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const dispatchEnabled = process.env.ENABLE_EMAIL_DISPATCH === 'true';

    let emailSent = false;
    if (dispatchEnabled) {
      console.log(`[CRON] Dispatching brief to ${targetEmail}...`);
      
      const auth: GoogleApiCredentials = {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
      };
      
      const config: DistributionConfig = {
        recipientEmail: targetEmail
      };
      
      if (auth.clientId && auth.clientSecret && auth.refreshToken) {
        emailSent = await sendBriefEmailDynamically(briefPayload, auth, config);
      } else {
        console.warn("[CRON] Missing Google API credentials in environment variables.");
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
