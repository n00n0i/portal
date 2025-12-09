import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAppDescription = async (name: string, url: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      I am adding a web application to my personal portal.
      App Name: "${name}"
      URL: "${url}"
      
      Please write a short, punchy, and professional description for this application (max 15 words).
      Do not include quotes in the output. Just the text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "A cool web application.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails or key is missing
    return "A useful web application.";
  }
};