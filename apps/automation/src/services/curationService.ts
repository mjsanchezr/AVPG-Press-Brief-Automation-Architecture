import { GoogleGenerativeAI } from '@google/generative-ai';

export class CurationService {
  private ai: GoogleGenerativeAI;

  constructor() {
    this.ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : this.ai;
    
    // Using the most reliable model name
    const modelName = 'gemini-1.5-flash';
    
    try {
      log(`Initiating synthesis with ${modelName} (Stable Mode)...`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: this.getSystemInstruction()
      });

      // No tools, no complex config. Pure generation.
      const result = await model.generateContent(`Generate the AVPG Press Brief for ${date}. Focus on Venezuela energy and regional macroeconomics.`);
      
      const markdown = result.response.text();
      
      if (!markdown) {
        throw new Error('Empty response from AI engine');
      }

      log(`Success: Intelligence synthesized via ${modelName}.`);
      return markdown;
    } catch (error: any) {
      log(`Critical AI Error: ${error.message}`);
      
      // Secondary fallback to 1.5-pro just in case flash is down/quota
      try {
        log("Attempting emergency fallback to gemini-1.5-pro...");
        const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', systemInstruction: this.getSystemInstruction() });
        const proResult = await proModel.generateContent(`Generate the AVPG Press Brief for ${date}.`);
        return proResult.response.text();
      } catch (proError: any) {
        log(`All models failed. Final Error: ${proError.message}`);
        throw new Error(`AI Synthesis Failure: ${proError.message}. This usually indicates an invalid API key or exhausted quota.`);
      }
    }
  }

  private getSystemInstruction(): string {
    return `
      TODAY IS FRIDAY, MAY 15, 2026. You are a Principal AI Automation Engineer & Senior Energy Analyst for AVPG.
      
      TASK: Generate a high-density intelligence brief for Friday, May 15, 2026.
      
      CONTENT FOCUS:
      - Venezuela: Eni/Repsol gas projects, Chevron operations, BCV inflation/exchange rates.
      - Region: Atlantic LNG, Petrobras 2026 plan.
      - Markets: WTI, Brent, Natural Gas prices for May 15, 2026.

      FORMAT:
      - High-density Markdown.
      - Professional analytical tone.
      - Use tables for markets.
      - Ensure length is sufficient for a 30-page PDF report.
    `;
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
