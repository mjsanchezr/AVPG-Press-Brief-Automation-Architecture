import { GoogleGenerativeAI } from '@google/generative-ai';

export class CurationService {
  private ai: GoogleGenerativeAI;

  constructor() {
    // Default instance using env var if present
    this.ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  async generateBrief(date: string, log: (msg: string) => void, geminiApiKey?: string): Promise<string> {
    const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : this.ai;
    
    // Attempt to use gemini-1.5-flash which is the most reliable model
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];
    
    for (const modelName of models) {
      try {
        log(`Attempting generation with ${modelName} (Search Grounding enabled)...`);
        
        // Ensure we are using the correct model object
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: this.getSystemInstruction()
        });

        // Use a more standard generation approach
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: `Generate the AVPG Press Brief for ${date}. Focus on energy and macroeconomics for Venezuela and the region.` }] }],
          // Search grounding is often the source of 403s/404s in some regions/projects
          // We will try it, but the fallback will skip it
          tools: [
            {
              // @ts-ignore
              googleSearchRetrieval: {}
            }
          ] as any
        });

        const markdown = result.response.text();
        if (markdown) {
          log(`Success: Intelligence synthesized via ${modelName}.`);
          return markdown;
        }
      } catch (error: any) {
        log(`Model ${modelName} failed: ${error.message}`);
        
        // Fallback: Try WITHOUT tools (Search Grounding)
        log(`Retrying ${modelName} WITHOUT search grounding...`);
        try {
          const simpleModel = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: this.getSystemInstruction()
          });
          const result = await simpleModel.generateContent(`Generate the AVPG Press Brief for ${date}. Focus on energy and macroeconomics for Venezuela and the region.`);
          const markdown = result.response.text();
          if (markdown) {
            log(`Success: Fallback synthesis complete via ${modelName} (No grounding).`);
            return markdown;
          }
        } catch (fallbackError: any) {
          log(`Simple generation for ${modelName} failed: ${fallbackError.message}`);
        }
      }
    }

    throw new Error("All AI synthesis models and methods failed. Please check your API key status.");
  }

  private getSystemInstruction(): string {
    return `
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
  }
}

export const curationService = new CurationService();

export async function fetchAndCurateLiveBrief(feeds: string[]): Promise<string> {
  const targetDate = '2026-05-15';
  return curationService.generateBrief(targetDate, (msg) => console.log(`[CurationService] ${msg}`));
}
