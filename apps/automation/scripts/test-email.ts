import * as dotenv from 'dotenv';
import { processBriefEngine } from '../src/services/curationService';
import { sendBriefEmail } from '../src/services/gmailService';

dotenv.config();

async function runTest() {
  console.log("🧪 Initiating Standalone Sandbox Test Harness");

  try {
    console.log("⏳ Generating mock brief payload via LLM Engine...");
    const payload = await processBriefEngine(["Simulation feed representing Venezuelan macro markers..."]);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'test@example.com';
    
    console.log(`📨 Attempting dispatch to ${adminEmail}...`);
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. The Gmail API call will likely fail in local mode.");
    }

    try {
      await sendBriefEmail(payload, adminEmail);
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
