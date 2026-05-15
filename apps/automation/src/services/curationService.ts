import { GoogleGenAI } from '@google/genai';

/**
 * Service to curate macroeconomic and energy intelligence using Gemini 2.0.
 * Strictly grounded in the May 11-15, 2026 timeframe.
 */
export async function curateIntelligence(apiKey: string): Promise<string> {
  // Initialize the modern Google GenAI SDK
  const ai = new GoogleGenAI({ 
    apiKey: apiKey,
    platform: 'google_ai' // Explicitly targeting the developer platform
  });

  const prompt = `
    TODAY IS FRIDAY, MAY 15, 2026.
    You are a Senior Energy Analyst for AVPG (Asociación Venezolana de Procesadores de Gas).
    
    TASK:
    Generate a high-density macroeconomic and energy intelligence brief.
    Use Google Search to discover news STRICTLY between May 11 and May 15, 2026.
    Ignore any data or news from April or earlier unless it provides critical context for a May event.
    
    OUTPUT FORMAT:
    Produce a professional, high-fidelity Markdown report replicating a 30-page corporate intelligence structure. 
    Use the following exact sections:
    
    1. # TITULARES (Top 5 critical global headlines)
    2. # VENEZUELA (Focus on Chevron, Eni, Repsol, and BCV monetary policy)
    3. # LATINOAMÉRICA (Focus on regional energy clusters, specifically Atlantic LNG/Trinidad)
    4. # TRANSICIÓN ENERGÉTICA (Hydrogen, solar, and carbon credit markets)
    5. # MERCADOS (Tabular data for WTI, Brent, Natural Gas Futures, and the VEB/USD exchange rate)
    
    TONE:
    Technical, objective, and industrial. Use Markdown tables for market data.
    Ensure explicit page breaks using <div style="page-break-after: always;"></div> between major sections.
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty intelligence report.");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini Curation Error:", error);
    throw new Error(`Intelligence Synthesis Failed: ${error.message}`);
  }
}
