export class CurationService {
  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const apiKey = geminiApiKey || process.env.GOOGLE_API_KEY || '';
    
    // Direct V1 call. We merge instructions into the user prompt for maximum compatibility.
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `
      ${this.getSystemInstruction()}
      
      Generate the AVPG Press Brief for ${date}. 
      Ensure the response is a high-density Markdown report focusing on Venezuela energy and regional markets.
    `;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    try {
      log("Initiating highly-compatible V1 API call...");
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Google API [${response.status}]: ${JSON.stringify(data)}`);
      }

      const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!markdown) {
        throw new Error("No content generated. Check if the prompt was blocked or API key restricted.");
      }

      log("Success: Intelligence synthesized via compatible protocol.");
      return markdown;
    } catch (error: any) {
      log(`API failure: ${error.message}`);
      throw new Error(`Synthesis Failed: ${error.message}`);
    }
  }

  private getSystemInstruction(): string {
    return `
      SYSTEM INSTRUCTIONS:
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
