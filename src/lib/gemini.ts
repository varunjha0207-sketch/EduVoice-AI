
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getAIReply(prompt: string, history: { role: string, parts: { text: string }[] }[], systemInstruction: string) {
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
