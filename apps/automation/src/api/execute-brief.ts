import { VercelRequest, VercelResponse } from '@vercel/node';
import { ExecutionPayload } from '../../../../shared/types';
import { fetchRawFeeds } from '../services/aggregatorService';
import { processBriefEngine } from '../services/curationService';
import { sendBriefEmailDynamically } from '../services/gmailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as ExecutionPayload;

    if (!payload?.credentials?.senderEmail || 
        !payload?.credentials?.appPassword || 
        !payload?.config?.recipientEmail) {
      return res.status(400).json({ error: 'Missing required configuration parameters (senderEmail, appPassword, recipientEmail)' });
    }

    console.log("[EXECUTE] Initiating dynamic ingestion sequence...");
    
    let rawFeeds: string[];
    if (payload.rawSourceData) {
      rawFeeds = [payload.rawSourceData];
    } else {
      rawFeeds = await fetchRawFeeds();
    }
    
    console.log(`[EXECUTE] Fetched ${rawFeeds.length} items. Invoking curation engine...`);
    const briefPayload = await processBriefEngine(rawFeeds);

    console.log(`[EXECUTE] Dispatching brief to ${payload.config.recipientEmail}...`);
    const emailSent = await sendBriefEmailDynamically(briefPayload, payload.credentials, payload.config);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      emailSent,
      data: briefPayload
    });

  } catch (error: any) {
    console.error("[EXECUTE] Pipeline failure:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal pipeline error'
    });
  }
}
