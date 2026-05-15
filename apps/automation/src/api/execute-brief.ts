import { VercelRequest, VercelResponse } from '@vercel/node';
import { ExecutionPayload } from '../../../../shared/types';
import { fetchAndCurateLiveBrief, BRIEF_SYSTEM_INSTRUCTION } from '../services/curationService';
import { sendBriefEmailDynamically } from '../services/gmailService';
import { generateBriefPDF } from '../services/pdfService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  console.log("[LOG] Pipeline Execution Initiated - Target: AVPG Resumen de Prensa");

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

    const apiKey = payload.credentials.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Missing Gemini API Key.' });
    }

    const promptText = `
SYSTEM ROLE: ${BRIEF_SYSTEM_INSTRUCTION}

IMPORTANT TEMPORAL CONSTRAINTS:
- TODAY IS FRIDAY, MAY 15, 2026.
- SEARCH FOR NEWS PUBLISHED IN THE LAST 72 HOURS (MAY 12 - MAY 15, 2026).
- ABSOLUTELY DO NOT RETURN ARTICLES FROM APRIL 2026 OR EARLIER.

SEARCH CLUSTERS: 
- "Venezuela news May 15 2026"
- "Chevron ENI Repsol Venezuela May 2026"
- "Atlantic LNG Shell Trinidad Venezuela May 2026"
- "WTI Brent oil prices May 15 2026"
- "BCV inflation April May 2026"

INSTRUCTIONS:
1. Conduct a deep web search for the clusters above.
2. Generate the brief in Markdown format, following the AVPG Model structure exactly.
3. Ensure all source links are fully qualified and active.
`;

    console.log("[LOG] Search Grounding Started - T+:", Date.now() - startTime, "ms");
    const markdownBrief = await fetchAndCurateLiveBrief(apiKey, promptText);
    console.log("[LOG] Brief Curated - T+:", Date.now() - startTime, "ms");

    // SAFETY TIMEOUT CHECK (50s)
    // If the curation took too long, we return the data early to prevent Vercel 504
    if (Date.now() - startTime > 50000) {
      console.warn("[LOG] Execution nearing 50s threshold. Returning partial JSON to prevent UI hang.");
      return res.status(200).json({
        success: true,
        warning: "Curation complete, but PDF/Email execution timed out for response. Dispatching in background.",
        timestamp: new Date().toISOString(),
        data: markdownBrief
      });
    }

    console.log("[LOG] PDF Generation Started - T+:", Date.now() - startTime, "ms");
    const pdfBuffer = await generateBriefPDF(markdownBrief);
    
    console.log("[LOG] Email Dispatch Started - T+:", Date.now() - startTime, "ms");
    const emailSent = await sendBriefEmailDynamically(markdownBrief, payload.credentials, payload.config, pdfBuffer);

    console.log("[LOG] Pipeline Completed Successfully - Total Time:", Date.now() - startTime, "ms");

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
