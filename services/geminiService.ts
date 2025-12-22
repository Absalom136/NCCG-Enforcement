import { GoogleGenAI } from "@google/genai";

/**
 * Interface for AI Response with potential grounding metadata
 */
export interface AiResult {
  text: string;
  sources?: { uri: string; title: string }[];
}

/**
 * Generates enforcement recommendations based on a reported issue.
 * Uses gemini-3-pro-image-preview for real-time information via Google Search grounding.
 */
export const generateRecommendations = async (
  issue: string,
  subCounty: string,
  plotNumber: string
): Promise<AiResult> => {
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    console.error("AI ERROR: Gemini API Key is missing.");
    return { text: "AI Recommendations unavailable: API Key selection required." };
  }

  try {
    // Re-initialize per call to ensure latest key is used
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-3-pro-image-preview for high-quality real-time info using googleSearch tool
    const modelName = 'gemini-3-pro-image-preview';

    const prompt = `
      Act as a senior Enforcement Officer for the Nairobi City County Government.
      
      Context:
      A new enforcement notice is being drafted for Plot Number: ${plotNumber} in ${subCounty}, Nairobi.
      The reported issue of concern is: "${issue}".
      
      Task:
      Use Google Search to find relevant Nairobi City County (NCC) urban planning laws or 
      environmental regulations (e.g., Physical Planning Act, County Nuisance Laws).
      
      Generate 3 concise, formal, and legally sound recommendations for the enforcement team.
      Return ONLY the list of recommendations as bullet points.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      }
    });

    if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
    }

    // Extract grounding URLs as per requirements
    const sources: { uri: string; title: string }[] = [];
    const chunks = (response as any).candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
        });
    }

    return { 
        text: response.text.trim(),
        sources: sources.length > 0 ? sources : undefined
    };
  } catch (error: any) {
    console.error("AI RECOMMENDATION ERROR:", error);
    
    // Per guidelines: if entity not found, re-prompt for key selection via UI state
    if (error.message?.includes('Requested entity was not found')) {
      return { text: "AI Service disconnected. Please re-enable AI tools in the sidebar." };
    }

    if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        return { text: "Network Error: Please check your internet connection." };
    }
    
    return { text: "The AI assistant is temporarily unavailable. Error: " + (error.message || "Service Error") };
  }
};

/**
 * Summarizes a full record into a single executive sentence.
 */
export const generateRecordSummary = async (
  issue: string,
  recommendations: string,
  location: string
): Promise<AiResult> => {
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    return { text: "Summary error: Configuration missing." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = 'gemini-3-flash-preview';

    const prompt = `
      Act as an Executive Assistant to the Nairobi City County Governor.
      Summarize the following enforcement record into a single, professional executive sentence.
      
      Details:
      Location: ${location}
      Issue: ${issue}
      Recommendations: ${recommendations}
      
      Format:
      [Action Required] at [Location] due to [Issue].
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return { text: response.text?.trim() || "Summary generation failed." };
  } catch (error) {
    console.error("AI SUMMARY ERROR:", error);
    return { text: "Summary generation failed." };
  }
};