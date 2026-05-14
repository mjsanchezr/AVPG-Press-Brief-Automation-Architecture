import { VercelRequest, VercelResponse } from '@vercel/node';
import { ExecutionPayload } from '../../../../shared/types';
import { fetchAndCurateLiveBrief, BRIEF_SYSTEM_INSTRUCTION } from '../services/curationService';
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

    // API Key for Gemini - can be passed in payload or environment
    const apiKey = payload.credentials.geminiApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Gemini API Key. Provide it in credentials or environment.' });
    }

    console.log("[EXECUTE] Initiating live intelligence discovery sequence with Google Search Grounding...");
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const promptText = `
${BRIEF_SYSTEM_INSTRUCTION}

Generate the live AVPG press brief for today, ${currentDate}. 
Use Google Search to find the latest real-time news for May 2026 across the specified sectors. 
Ensure all links are active and discovered during the search pass.
Follow the Playbook Layout exactly.`;

    const markdownBrief = await fetchAndCurateLiveBrief(apiKey, promptText);

    console.log(`[EXECUTE] Brief curated successfully. Length: ${markdownBrief.length} chars.`);
    
    console.log(`[EXECUTE] Dispatching brief to ${payload.config.recipientEmail}...`);
    
    // Note: gmailService might need adjustment to handle raw markdown
    const emailSent = await sendBriefEmailDynamically(markdownBrief, payload.credentials, payload.config);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      emailSent,
      data: markdownBrief
    });

  } catch (error: any) {
    console.error("Serverless Pipeline Crash:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An internal server error occurred within the automation workspace.",
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
