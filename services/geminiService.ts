import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelType, GenerationConfig } from "../types";

// Ensure API key is present
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Creates a chat session.
 */
export const createChatSession = (model: string, systemInstruction?: string): Chat => {
  return ai.chats.create({
    model: model,
    config: {
      systemInstruction,
    },
  });
};

/**
 * Generates content from text prompt.
 */
export const generateText = async (
  prompt: string, 
  model: string = ModelType.FLASH,
  config?: GenerationConfig
): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      thinkingConfig: config?.thinkingBudget ? { thinkingBudget: config.thinkingBudget } : undefined
    }
  });
};

/**
 * Uses Gemini to polish an airdrop description.
 */
export const enhanceAirdropDescription = async (projectName: string, rawNotes: string): Promise<string> => {
  const prompt = `You are a professional crypto marketing copywriter. Write a concise, exciting, and professional description for a cryptocurrency airdrop for the project "${projectName}". 
  
  Here are the raw notes/details from the user: "${rawNotes}". 
  
  Format it as a single compelling paragraph followed by a very short bulleted list of 3 key highlights. Do not include markdown formatting like bolding or headers, just plain text with newlines.`;
  
  const response = await generateText(prompt, ModelType.FLASH);
  return response.text || "";
};

/**
 * Analyzes an image with a text prompt.
 */
export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: ModelType.FLASH,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
};

/**
 * Generates an image based on a prompt.
 */
export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any
      }
    }
  });

  const images: string[] = [];
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        images.push(`data:${mime};base64,${part.inlineData.data}`);
      }
    }
  }
  return images;
};

/**
 * Returns the Gemini Live client.
 */
export const getLiveClient = () => {
  return ai.live;
};
