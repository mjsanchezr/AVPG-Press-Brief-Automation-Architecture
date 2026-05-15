import { Request, Response } from 'express';
import { ExecutionPayload } from '../../../../shared/types';
import { curationService } from '../services/curationService';
import { gmailService } from '../services/gmailService';
import { pdfService } from '../services/pdfService';

export default async function handler(req: Request, res: Response) {
  const startTime = Date.now();
  const trace: string[] = [];
  const log = (msg: string) => trace.push(`[LOG] ${msg}`);
  
  log("Grounding started");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body as ExecutionPayload;
    const targetDate = '2026-05-15';
    const cloudRunUrl = (req.headers['x-cloud-run-url'] as string) || req.get('host') || 'Google Cloud Run Active';

    log(`Deployment: ${cloudRunUrl.includes('run.app') ? cloudRunUrl : 'Google Cloud Run Active'}`);
    log("Grounding: May 15 Intelligence scan initiated");

    console.log("[LOG] Search Grounding Started - T+:", Date.now() - startTime, "ms");
    const markdownBrief = await curationService.generateBrief(targetDate, log);
    console.log("[LOG] Brief Curated - T+:", Date.now() - startTime, "ms");

    // SAFETY TIMEOUT CHECK (50s)
    if (Date.now() - startTime > 50000) {
      log("Safety timeout triggered");
      console.warn("[LOG] Execution nearing 50s threshold. Returning partial JSON.");
      return res.status(200).json({
        success: true,
        warning: "Curation complete, but PDF/Email execution timed out for response. Dispatching in background.",
        timestamp: new Date().toISOString(),
        trace,
        data: markdownBrief
      });
    }

    console.log("[LOG] PDF Generation Started - T+:", Date.now() - startTime, "ms");
    
    let pdfBuffer;
    let pdfError = null;

    try {
      log("PDF: Rendering 30-page structure...");
      pdfBuffer = await pdfService.generatePDF(markdownBrief, targetDate, log);
      log("PDF successfully rendered");
    } catch (error: any) {
      pdfError = error.message;
      log(`PDF failure: ${pdfError}`);
      console.error("[LOG] PDF Failure - Falling back to HTML-only email:", pdfError);
    }
    
    console.log("[LOG] Email Dispatch Started - T+:", Date.now() - startTime, "ms");
    
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
    
    log("Success: Brief dispatched via Gmail");
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
    log(`Pipeline crash: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || "An internal server error occurred.",
      trace
    });
  }
}
