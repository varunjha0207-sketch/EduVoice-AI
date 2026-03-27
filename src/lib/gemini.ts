
import { GoogleGenAI } from "@google/genai";

// Use a getter to initialize AI safely and only when needed
let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (aiInstance) return aiInstance;
  
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will not work.");
    return null;
  }
  
  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

export async function getAIReply(prompt: string, history: { role: string, parts: { text: string }[] }[], systemInstruction: string) {
  const ai = getAI();
  if (!ai) return "Error: AI configuration is missing. Please check your API key.";

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction,
    }
  });

  const response = await model;
  return response.text || "I'm sorry, I couldn't process that.";
}

export async function generateFeedback(history: { role: string, text: string }[]) {
  const ai = getAI();
  if (!ai) return { feedback: "AI configuration is missing.", notes: [] };

  const prompt = `Based on the following conversation, provide constructive feedback and a list of key learning points (notes).
  Conversation:
  ${history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}
  
  Return the response in JSON format:
  {
    "feedback": "Overall feedback string",
    "notes": ["point 1", "point 2", ...]
  }`;

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { feedback: "Could not generate feedback.", notes: [] };
  }
}
