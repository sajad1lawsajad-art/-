import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mood: {
      type: Type.STRING,
      description: "A single word or short phrase describing the mood of the entry in Arabic (e.g., سعيد, متأمل, حزين).",
    },
    moodColor: {
      type: Type.STRING,
      description: "A hex color code representing the mood (e.g., #FFD700 for happy, #708090 for sad).",
    },
    reflection: {
      type: Type.STRING,
      description: "A brief, supportive, and philosophical reflection or advice based on the entry, in Arabic.",
    },
  },
  required: ["mood", "moodColor", "reflection"],
};

export const analyzeDiaryEntry = async (title: string, content: string): Promise<AIAnalysisResult | null> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  try {
    const prompt = `
      قم بتحليل تدوينة اليوميات التالية. 
      استخرج الحالة المزاجية، واقترح لونًا مناسبًا للحالة، واكتب تأملاً قصيرًا أو نصيحة ودية للمستخدم.
      
      العنوان: ${title}
      المحتوى: ${content}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an empathetic, wise Arabic diary assistant. Your goal is to help the user understand their emotions and provide gentle wisdom.",
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing diary entry:", error);
    throw error;
  }
};
