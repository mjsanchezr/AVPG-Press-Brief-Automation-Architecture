/**
 * AGGREGATOR SERVICE
 * Refactored to eliminate mock data feeds. 
 * Real-time discovery is now handled by the Gemini Grounding Engine in curationService.ts.
 */

export async function fetchRawFeeds(): Promise<string[]> {
  // Discovery is now autonomous via Google Search Grounding.
  // This service can be extended in the future to ingest proprietary data sources
  // (e.g., Bloomberg terminals, private internal databases) that are not web-accessible.
  console.log("[AGGREGATOR] Bypassing legacy mock feeds. Autonomous discovery active.");
  return [];
}
