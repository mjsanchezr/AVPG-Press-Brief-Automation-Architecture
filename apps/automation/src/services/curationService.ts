import { GoogleGenAI } from '@google/genai';

/**
 * PRODUCTION-GRADE INTELLIGENCE AGENT
 * This service leverages Gemini 2.5 Flash with Google Search Grounding to perform
 * real-time macro discovery and curation for the AVPG press brief.
 */

export const BRIEF_SYSTEM_INSTRUCTION = `
Role: Senior Business Intelligence Analyst for AVPG (Grounded Intelligence Analyst).
Temporal Guardrail: TODAY is May 15, 2026. You MUST ONLY use news published between May 11, 2026, and May 15, 2026. ABSOLUTELY IGNORE all data from April 2026 or earlier. If a source does not have a date in May 2026, discard it.

Deduplication & Synthesis: Perform cross-source verification. If multiple sources report the same event, synthesize them into a single high-density entry.

Structure Blueprint (Match Model Exactly):

1. PAGE 1: OVERVIEW
- Header: "RESUMEN DE PRENSA"
- Date: "Viernes, 15 de mayo de 2026"
- Section: "TITULARES" (List all headlines grouped by the categories below).

2. CORE SECTIONS:
- VENEZUELA
- LATINOAMÉRICA Y EL CARIBE
- INTERNACIONALES
- TRANSICIÓN ENERGÉTICA
- MERCADOS

3. CONTENT BLOCKS (For each headline):
- 📌 [Titular]
- 2-3 paragraphs of high-density analytical summary focusing on business implications.
- 🔗 Fuente: [Active Hyperlink]
- [Volver a Titulares](#titulares) (Internal navigation link)

4. MARKET DATA (Final Section):
Generate a Markdown table for:
- WTI, Brent, Cesta OPEP.
- Gas Futures: Henry Hub, JKM, TTF.
Use real-time search data for May 15, 2026.
`;

export async function fetchAndCurateLiveBrief(apiKey: string, promptText: string): Promise<string> {
  try {
    // Instantiated inside the execution scope to ensure cold start safety
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        // Declared explicitly matching the new configuration types contract
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || '';
  } catch (error: any) {
    console.error("Curation Service failure path:", error);
    throw error;
  }
}

/**
 * Legacy support for the previous engine interface if needed, 
 * but now redirected to the live grounded agent.
 */
export async function processBriefEngine(rawFeeds: string[]): Promise<any> {
  console.warn("processBriefEngine is deprecated. Use fetchAndCurateLiveBrief for live grounding.");
  return {
    titleBlock: "DEPRECATED - USE LIVE BRIEF",
    titularDelDia: "The system has transitioned to live Google Search Grounding.",
    oilGas: [],
    economiaInversion: [],
    contextoInternacional: [],
    paraTenerEnCuenta: []
  };
}

