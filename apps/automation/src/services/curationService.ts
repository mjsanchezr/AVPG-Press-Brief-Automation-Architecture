import { GoogleGenAI } from '@google/genai';

export class CurationService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
  }

  async generateBrief(date: string, log: (msg: string) => void): Promise<string> {
    const model = 'gemini-2.0-flash';
    log(`Initializing AI Grounding Engine with ${model}`);

    const systemInstruction = `
      TODAY IS FRIDAY, MAY 15, 2026. You are a Principal AI Automation Engineer & Senior Business Intelligence Analyst for AVPG.
      
      TASK: Execute a multi-cluster search for news published strictly between May 11 and May 15, 2026.
      
      GROUNDING CONSTRAINTS:
      - Venezuela Energy: Focus on Chevron, ENI, Repsol, and OFAC licenses.
      - Regional News: Atlantic LNG, Trinidad & Tobago, Caribbean energy integration.
      - Market Data: Live prices for WTI, Brent, and Natural Gas Futures (Henry Hub, JKM).
      - Macroeconomics: BCV (Banco Central de Venezuela) updates and exchange rate stability.

      STRUCTURAL BLUEPRINT (Replicate 30-page fidelity):
      1. Section 1: Titulares - A high-density list of the top 10 stories with anchor links.
      2. Section 2: Venezuela - Detailed analytical blocks for national energy news.
      3. Section 3: Latinoamerica & Caribe - Regional energy focus.
      4. Section 4: Transición Energética - Global and local shifts towards green energy.
      5. Section 5: Mercados - A clean data table with current prices and weekly trends.

      OUTPUT FORMAT:
      - Structured Markdown with active click-through hyperlinks.
      - Each news item MUST have a "🔗 Fuente" link.
      - Professional, high-density analytical tone.
      - For Markets, use Markdown tables.
      - Avoid placeholders. Use real data from the search window.
    `;

    const prompt = `Generate the AVPG Press Brief for ${date}. Focus on the specified sectors and ensure grounding is active for the most recent data.`;

    try {
      const result = await this.ai.models.generateContent({
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
      log(`AI Grounding Error: ${error.message}`);
      throw error;
    }
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
