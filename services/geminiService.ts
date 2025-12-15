import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || ''; 

// We handle the case where API key might be missing gracefully in the UI
// but for the service we assume it will be provided or we return a placeholder.

export const generateRecommendations = async (
  issue: string,
  subCounty: string,
  plotNumber: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing.");
    return "AI Recommendations unavailable (Missing API Key). Please enter manually.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // We use a specific model suitable for text generation
    const model = 'gemini-2.5-flash';

    const prompt = `
      Act as a senior Enforcement Officer for the Nairobi City County Government.
      
      Context:
      A new enforcement notice is being drafted for Plot Number: ${plotNumber} in ${subCounty}.
      The reported issue of concern is: "${issue}".
      
      Task:
      Generate 3 concise, formal, and legally sound recommendations for the enforcement team.
      The recommendations should align with urban planning and public nuisance laws.
      Return ONLY the list of recommendations as bullet points.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "No recommendations generated.";
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return "Error generating recommendations. Please check network or API key.";
  }
};

export const generateRecordSummary = async (
  issue: string,
  recommendations: string,
  location: string
): Promise<string> => {
  if (!API_KEY) {
    return "AI Summary unavailable (Missing API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
      Act as an Executive Assistant to the Nairobi City County Governor.
      
      Task:
      Summarize the following enforcement record into a single, concise, and professional sentence suitable for a high-level executive report.
      
      Details:
      Location: ${location}
      Issue: ${issue}
      Recommendations: ${recommendations}
      
      Format:
      [Action Required] at [Location] due to [Issue].
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Summary could not be generated.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
};