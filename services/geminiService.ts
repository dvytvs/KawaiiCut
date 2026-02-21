import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const askWaifuAssistant = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are a helpful and professional video editing assistant inside a software called "KawaiiCut". 
        Your job is to help the user edit videos. 
        Keep your responses short, helpful, and professional. 
        Do not explain complex technical video engineering terms deeply, keep it beginner friendly.
        If the user asks about features, assume this software has basic cutting, trimming, scaling, and rotation features.`,
      },
    });
    return response.text || "Sorry, I didn't catch that. Could you try asking again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops! I'm having trouble connecting right now... (Error)";
  }
};