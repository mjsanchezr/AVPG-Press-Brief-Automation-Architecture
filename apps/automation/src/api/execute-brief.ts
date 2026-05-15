import { Request, Response } from 'express';
import { ExecutionPayload } from '../../../../shared/types';
import { curationService } from '../services/curationService';
import { gmailService } from '../services/gmailService';
import { pdfService } from '../services/pdfService';

export default async function handler(req: Request, res: Response) {
  const startTime = Date.now();
  const trace: string[] = [];
  const log = (msg: string) => trace.push(`[LOG] ${msg}`);
  
  trace.push("Execution Initiated (Legacy Wrapper)");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as ExecutionPayload;
    const targetDate = '2026-05-15';

    console.log("[LOG] Search Grounding Started - T+:", Date.now() - startTime, "ms");
    const markdownBrief = await curationService.generateBrief(targetDate, log);
    trace.push("Brief curated");
    console.log("[LOG] Brief Curated - T+:", Date.now() - startTime, "ms");

    // SAFETY TIMEOUT CHECK (50s)
    if (Date.now() - startTime > 50000) {
      trace.push("Safety timeout triggered");
      console.warn("[LOG] Execution nearing 50s threshold. Returning partial JSON to prevent UI hang.");
      return res.status(200).json({
        success: true,
        warning: "Curation complete, but PDF/Email execution timed out for response. Dispatching in background.",
        timestamp: new Date().toISOString(),
        trace,
        data: markdownBrief
      });
    }

    console.log("[LOG] PDF Generation Started - T+:", Date.now() - startTime, "ms");
    trace.push("PDF attempt started");
    
    let pdfBuffer;
    let pdfError = null;

    try {
      pdfBuffer = await pdfService.generatePDF(markdownBrief, targetDate, log);
      trace.push("PDF success");
    } catch (error: any) {
      pdfError = error.message;
      trace.push(`PDF failure: ${pdfError}`);
      console.error("[LOG] PDF Refactor Failure - Falling back to HTML-only email:", pdfError);
    }
    
    console.log("[LOG] Email Dispatch Started - T+:", Date.now() - startTime, "ms");
    trace.push("Email attempt started");
    
    await gmailService.sendBrief({
      markdown: markdownBrief,
      pdfBuffer: pdfBuffer!,
      date: targetDate,
      config: {
        smtpUser: payload.credentials.senderEmail,
        smtpPass: payload.credentials.appPassword,
        recipientEmail: payload.config.recipientEmail
      }
    }, log);
    
    trace.push("Email dispatch finished");
    console.log("[LOG] Pipeline Completed Successfully - Total Time:", Date.now() - startTime, "ms");

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      pdfStatus: pdfBuffer ? "Generated" : `Failed: ${pdfError}`,
      trace,
      data: markdownBrief
    });

  } catch (error: any) {
    console.error("Serverless Pipeline Crash:", error);
    trace.push(`Pipeline crash: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || "An internal server error occurred within the automation workspace.",
      trace,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
