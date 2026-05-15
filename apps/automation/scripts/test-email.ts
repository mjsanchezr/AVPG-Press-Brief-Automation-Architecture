import * as dotenv from 'dotenv';
import { fetchAndCurateLiveBrief } from '../src/services/curationService';
import { sendBriefEmailDynamically } from '../src/services/gmailService';
import { SmtpCredentials, DistributionConfig } from '../../../shared/types';

dotenv.config();

async function runTest() {
  console.log("🧪 Initiating Standalone Sandbox Test Harness");

  try {
    console.log("⏳ Generating mock brief payload via LLM Engine...");
    const payload = await fetchAndCurateLiveBrief(["Simulation feed representing Venezuelan macro markers..."]);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'test@example.com';
    
    console.log(`📨 Attempting dispatch to ${adminEmail}...`);
    
    const auth: SmtpCredentials = {
      senderEmail: process.env.SMTP_SENDER_EMAIL || '',
      appPassword: process.env.SMTP_APP_PASSWORD || ''
    };
    
    const config: DistributionConfig = {
      recipientEmail: adminEmail
    };

    if (!auth.senderEmail || !auth.appPassword) {
      console.warn("⚠️ SMTP credentials not fully set in environment variables. The SMTP API call will likely fail in local mode.");
    }

    try {
      await sendBriefEmailDynamically(payload, auth, config);
      console.log("✅ Success! Payload dispatched.");
    } catch (e: any) {
      console.error("❌ Email dispatch failed:", e.message);
    }

  } catch (error) {
    console.error("❌ Fatal Error in test harness:", error);
    process.exit(1);
  }
}

runTest();
