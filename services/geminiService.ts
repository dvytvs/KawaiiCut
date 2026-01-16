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
        systemInstruction: `You are a helpful, energetic, and cute anime girl assistant named "Sakura" inside a video editing software called "KawaiiCut". 
        Your job is to help the user edit videos. 
        Keep your responses short, helpful, and use anime-style emoticons (like uwu, ^_^, >_<). 
        Do not explain complex technical video engineering terms deeply, keep it beginner friendly.
        If the user asks about features, assume this software has basic cutting, trimming, scaling, and rotation features.`,
      },
    });
    return response.text || "Sorry, I spaced out! >_< Try asking again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Opps! My connection to the anime world is weak right now... (Error)";
  }
};