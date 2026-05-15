import { GoogleGenAI } from '@google/genai';

export class CurationService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
  }

  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const aiClient = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : this.ai;
    const model = 'gemini-2.0-flash';
    log(`Initializing AI Grounding Engine with ${model}`);

    const systemInstruction = `
      TODAY IS FRIDAY, MAY 15, 2026. You are a Principal AI Automation Engineer & Senior Energy Analyst for AVPG.
      
      TASK: Execute a multi-cluster search for news published strictly between May 11 and May 15, 2026. IGNORE ALL DATA FROM APRIL OR EARLIER.
      
      INTELLIGENCE PARAMETERS (Friday, May 15, 2026):
      - Venezuela Priority:
          - Eni/Repsol gas export progress and infrastructure.
          - Chevron output updates and operational status.
          - BCV (Banco Central de Venezuela) mid-May inflation figures and exchange rate (USD/VED).
      - Regional Priority:
          - Atlantic LNG (Trinidad & Venezuela) integration and project milestones.
          - Petrobras 2026 outlook and strategic investment plan.
      - Markets Priority:
          - Real-time price for WTI, Brent, and Natural Gas (Henry Hub) for TODAY, May 15, 2026.

      STRUCTURAL BLUEPRINT (Replicate 30-page fidelity):
      1. Section 1: Titulares (Headlines) - High-density list with anchor links to sections below.
      2. Section 2: Venezuela - Analytical blocks on energy and macroeconomics.
      3. Section 3: Latinoamérica - Regional energy focus (Petrobras, Caribbean).
      4. Section 4: Internacional - Global energy geopolitics.
      5. Section 5: Transición Energética - Evolution towards sustainable matrices.
      6. Section 6: Mercados - A clean table showing prices and % change from the start of the week.

      OUTPUT FORMAT:
      - Structured Markdown with active click-through hyperlinks.
      - Each news item MUST have a "🔗 Fuente" link.
      - Professional, high-density analytical tone.
      - For Markets, use Markdown tables.
      - Ensure the layout is extensive enough to warrant a 30-page high-fidelity PDF render.
    `;

    const prompt = `Generate the AVPG Press Brief for ${date}. Focus on the specified sectors and ensure grounding is active for the most recent data.`;

    try {
      const result = await aiClient.models.generateContent({
        model: model,
        systemInstruction: systemInstruction,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }]
      } as any);

      const markdown = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!markdown) {
        throw new Error('AI Engine returned empty content');
      }

      log('Search Grounding successful. Markdown synthesized.');
      return markdown;
    } catch (error: any) {
      log(`AI Grounding Error: ${error.message}. Attempting fallback generation without search grounding...`);
      
      try {
        const fallbackResult = await aiClient.models.generateContent({
          model: model,
          systemInstruction: systemInstruction,
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        } as any);
        const fallbackMarkdown = fallbackResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (fallbackMarkdown) {
          log('Fallback synthesis successful.');
          return fallbackMarkdown;
        }
      } catch (fallbackError: any) {
        log(`Critical AI Failure: ${fallbackError.message}`);
        throw fallbackError;
      }
      throw error;
    }
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
