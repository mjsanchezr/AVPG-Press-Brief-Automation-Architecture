import * as dotenv from 'dotenv';
import { processBriefEngine } from '../src/services/curationService';
import { sendBriefEmailDynamically } from '../src/services/gmailService';
import { GoogleApiCredentials, DistributionConfig } from '../../../shared/types';

dotenv.config();

async function runTest() {
  console.log("🧪 Initiating Standalone Sandbox Test Harness");

  try {
    console.log("⏳ Generating mock brief payload via LLM Engine...");
    const payload = await processBriefEngine(["Simulation feed representing Venezuelan macro markers..."]);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'test@example.com';
    
    console.log(`📨 Attempting dispatch to ${adminEmail}...`);
    
    const auth: GoogleApiCredentials = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
    };
    
    const config: DistributionConfig = {
      recipientEmail: adminEmail
    };

    if (!auth.clientId || !auth.clientSecret || !auth.refreshToken) {
      console.warn("⚠️ Google API credentials not fully set in environment variables. The Gmail API call will likely fail in local mode.");
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
