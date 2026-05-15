export class CurationService {
  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const apiKey = geminiApiKey || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) throw new Error("Missing API Key. Please provide a valid Gemini API Key.");

    // The most robust way to find a working model is to try them in order of reliability
    const targetModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro' // Legacy 1.0 fallback
    ];

    let lastError = null;

    for (const modelId of targetModels) {
      try {
        log(`Attempting synthesis with model: ${modelId}...`);
        
        // We use v1beta as it typically has the widest model availability for new keys
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [{
            parts: [{ text: `${this.getSystemInstruction()}\n\nGenerate the AVPG Press Brief for ${date}. Focus on Venezuela energy and regional markets.` }]
          }],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            maxOutputTokens: 8192
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          const markdown = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (markdown) {
            log(`Success: Intelligence synthesized via ${modelId}.`);
            return markdown;
          }
        }

        log(`Model ${modelId} failed: ${data.error?.message || 'Unknown error'}`);
        lastError = data.error?.message || `HTTP ${response.status}`;
      } catch (e: any) {
        log(`Network/Protocol error for ${modelId}: ${e.message}`);
        lastError = e.message;
      }
    }

    // FINAL FALLBACK: Model Discovery
    // If hardcoded models fail, we try to ask the API what models ARE available
    try {
      log("All primary models failed. Attempting Model Discovery...");
      const discoveryUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const discoveryResp = await fetch(discoveryUrl);
      const discoveryData = await discoveryResp.json();
      
      if (discoveryData.models && discoveryData.models.length > 0) {
        const availableModels = discoveryData.models
          .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
          .map((m: any) => m.name.split('/').pop());
        
        log(`Discovery found available models: ${availableModels.join(', ')}`);
        
        if (availableModels.length > 0) {
          const firstAvailable = availableModels[0];
          log(`Attempting discovery fallback with: ${firstAvailable}...`);
          // ... repeat call with firstAvailable
          const finalUrl = `https://generativelanguage.googleapis.com/v1beta/models/${firstAvailable}:generateContent?key=${apiKey}`;
          const finalResp = await fetch(finalUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Generate a short brief for ${date}.` }] }]
            })
          });
          const finalData = await finalResp.json();
          return finalData.candidates?.[0]?.content?.parts?.[0]?.text || "Discovery model failed to produce text.";
        }
      }
    } catch (discoveryError: any) {
      log(`Discovery failed: ${discoveryError.message}`);
    }

    throw new Error(`Exhaustive Synthesis Failure. Last error: ${lastError}. Please verify your API key has the 'Generative Language API' enabled in Google Cloud Console.`);
  }

  private getSystemInstruction(): string {
    return `
      TODAY IS FRIDAY, MAY 15, 2026. You are a Principal AI Automation Engineer & Senior Energy Analyst for AVPG.
      TASK: Generate a high-density intelligence brief for Friday, May 15, 2026.
      Focus on Venezuela energy (Chevron, Eni, Repsol) and regional macroeconomics.
      Format: Markdown. Tone: Professional.
    `;
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
