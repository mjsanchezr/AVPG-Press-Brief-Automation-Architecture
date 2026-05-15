export class CurationService {
  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const apiKey = geminiApiKey || process.env.GOOGLE_API_KEY || '';
    
    // We will use the V1 (STABLE) endpoint directly via fetch to bypass any SDK versioning issues
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: `Generate a high-density AVPG Press Brief for ${date}. Focus on Venezuela energy (Chevron, Eni, Repsol) and markets (WTI, Brent).` }]
      }],
      systemInstruction: {
        role: "system",
        parts: [{ text: this.getSystemInstruction() }]
      },
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40
      }
    };

    try {
      log("Initiating direct V1 API call to Gemini 1.5 Flash...");
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Google API Error [${response.status}]: ${JSON.stringify(data)}`);
      }

      const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!markdown) {
        throw new Error("API returned success but no content candidates.");
      }

      log("Success: Intelligence synthesized via direct V1 integration.");
      return markdown;
    } catch (error: any) {
      log(`Direct API Failure: ${error.message}`);
      
      // Final attempt: try V1BETA if V1 failed (though usually it's the other way around)
      try {
        log("Retrying via V1BETA endpoint...");
        const betaUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const betaResp = await fetch(betaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const betaData = await betaResp.json();
        const betaMarkdown = betaData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (betaMarkdown) return betaMarkdown;
      } catch (e) {}

      throw new Error(`AI Synthesis Failed at protocol level: ${error.message}`);
    }
  }

  private getSystemInstruction(): string {
    return `
      TODAY IS FRIDAY, MAY 15, 2026. You are a Principal AI Automation Engineer & Senior Energy Analyst for AVPG.
      TASK: Generate a high-density intelligence brief for Friday, May 15, 2026.
      FORMAT: Markdown. Tone: Professional, Industrial.
    `;
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
