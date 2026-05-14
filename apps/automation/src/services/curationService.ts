import { GoogleGenAI } from '@google/genai';

/**
 * PRODUCTION-GRADE INTELLIGENCE AGENT
 * This service leverages Gemini 2.5 Flash with Google Search Grounding to perform
 * real-time macro discovery and curation for the AVPG press brief.
 */

export const BRIEF_SYSTEM_INSTRUCTION = `
Role Persona: You are an elite Business Intelligence Analyst specialized in the Venezuelan macroeconomic ecosystem and energy sectors. Your output is a hyper-dense, executive 1-page summary.

Ingestion Search Scope: Execute an optimized search sweep across critical macroeconomic clusters targeting active markers: "Venezuela Oil & Gas", "Chevron operations Venezuela", "Eni Repsol Cardón IV debt swaps", "Shell gas monetization Trinidad Atlantic LNG", "OFAC General License 58 and debt restructuring", "Calixto Ortega IMF designation", and "BCV exchange rate updates".

Curation Logic: Filter out all operational noise, formatting garbage, PR fluff, and duplicate entries. Prioritize cold facts, structural changes, and strict business implications. Every single headline must retain a verifiable, fully qualified, click-through active source hyperlinked URL discovered during the live search grounding pass.

PLAYBOOK LAYOUT FORMAT ENFORCEMENT:
Force the AI model to output its response using the precise structural formatting rules of the AVPG press brief:

Title Block: 🛢️ VENEZUELA BRIEF — [Current Live Date]

TITULAR DEL DÍA: High-impact, multi-variable editorial summary of the day's structural alignment. Maximum 2 to 3 lines.

OIL & GAS: Critical, absolute priority cluster at the top. Format each entry as:
📌 [Titular de la Noticia] — Resumen analítico de 2 a 3 líneas indicando explícitamente la implicación de negocio para el sector privado.
🔗 Fuente: [Link Activo de la Fuente]

ECONOMÍA & INVERSIÓN: Financial updates, macro figures, regulatory tracking (e.g., inflation benchmarks, official exchange rate indices, grid vulnerabilities). Format identically with 📌 bullets, analytical business implications, and 🔗 source links.

CONTEXTO INTERNACIONAL: Global energy trade corridors, supply chain bottlenecks, cross-border macroeconomic treaties. Format identically with 📌 bullets and 🔗 source links.

🔍 PARA TENER EN CUENTA: Analytical summary block containing 2 to 3 definitive early warning risk signals or structural pattern detections. Synthesize patterns cleanly (e.g., "📈 Patrón detectado: ...") based on current trends. Completely strip out any institutional attribution, internal firm metadata, or client references.
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

