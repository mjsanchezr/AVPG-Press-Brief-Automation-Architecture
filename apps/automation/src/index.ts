import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { curationService } from './services/curationService';
import { pdfService } from './services/pdfService';
import { gmailService } from './services/gmailService';

console.log(`[DEBUG] Current Directory: ${process.cwd()}`);
try {
  const distPath = path.join(__dirname, '../dist');
  if (fs.existsSync(distPath)) {
    console.log(`[DEBUG] Files in dist: ${fs.readdirSync(distPath)}`);
  } else {
    console.log(`[DEBUG] dist directory not found at ${distPath}`);
  }
} catch (e) {
  console.log(`[DEBUG] Failed to list dist: ${e}`);
}

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Main Route: Execute Press Brief
app.post('/api/execute-brief', async (req, res) => {
  const trace: string[] = [];
  const log = (msg: string) => {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    console.log(entry);
    trace.push(entry);
  };

  try {
    log('Container Cold Start / Request Received');
    
    const { config } = req.body;
    const targetDate = '2026-05-15';
    
    log('Search Grounding Active: Querying May 11 - May 15, 2026');
    const briefMarkdown = await curationService.generateBrief(targetDate, log);
    
    log('Rendering 30-page PDF Report');
    const pdfBuffer = await pdfService.generatePDF(briefMarkdown, targetDate, log);
    
    log('Dispatching via Distribution Layer');
    await gmailService.sendBrief({
      markdown: briefMarkdown,
      pdfBuffer,
      date: targetDate,
      config
    }, log);

    log('Process Complete: Success');
    res.json({
      success: true,
      trace,
      markdown: briefMarkdown
    });
  } catch (error: any) {
    log(`ERROR: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      trace
    });
  }
});

const PORT = process.env.PORT || 8080;
// Hard-coded 0.0.0.0 to ensure visibility to Google Cloud Run load balancer
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SUCCESS] AVPG Automation Service active on 0.0.0.0:${PORT}`);
});
