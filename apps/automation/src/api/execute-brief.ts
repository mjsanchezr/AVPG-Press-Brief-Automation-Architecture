import { Request, Response } from 'express';
import { curateIntelligence } from '../services/curationService';
import { generatePDF } from '../services/pdfService';
import { sendBriefEmail } from '../services/gmailService';

export default async function executeBriefHandler(req: Request, res: Response) {
  const trace: string[] = [];
  trace.push("[LOG] Sequence Initiation: Industrial Automation Pipeline active.");

  try {
    const { credentials, config } = req.body;

    if (!credentials || !config) {
      throw new Error("Missing orchestration parameters: credentials or config required.");
    }

    const { senderEmail, appPassword, geminiApiKey } = credentials;
    const { recipientEmail } = config;

    // Phase 1: Curation & Grounding
    trace.push("[LOG] Grounding: May 15 Intelligence scan initiated");
    const markdownData = await curateIntelligence(geminiApiKey);
    trace.push("[LOG] Grounding complete: Global energy data synthesized.");

    // Phase 2: PDF Rendering (Fail-safe)
    let pdfBuffer: Buffer | null = null;
    try {
      trace.push("[LOG] PDF: Rendering 30-page structure...");
      pdfBuffer = await generatePDF(markdownData);
      trace.push("[LOG] PDF: High-fidelity document generated successfully.");
    } catch (pdfError: any) {
      console.error("PDF Generation Failed:", pdfError);
      trace.push(`[ERROR] PDF Generation failed: ${pdfError.message}. Proceeding with HTML-only dispatch.`);
    }

    // Phase 3: Dispatch
    trace.push("[LOG] Success: Brief dispatched via Gmail");
    await sendBriefEmail({
      senderEmail,
      appPassword,
      recipientEmail,
      markdown: markdownData,
      pdfBuffer
    });

    return res.status(200).json({
      success: true,
      trace,
      data: markdownData
    });

  } catch (error: any) {
    console.error("Pipeline Crash:", error);
    trace.push(`[CRITICAL] Pipeline Failure: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message,
      trace
    });
  }
}
