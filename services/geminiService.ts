
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Streams a response from the Gemini 3 Pro model using multi-agent system instructions.
 */
export const generateAtlasResponseStream = async (
  query: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  onChunk: (chunk: string) => void
) => {
  const modelName = 'gemini-3-pro-preview';
  
  const contents = history.map(turn => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: query }]
  });

  try {
    const stream = await ai.models.generateContentStream({
      model: modelName,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    let accumulator = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        accumulator += chunkText;
        onChunk(chunkText);
      }
    }
    return accumulator;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API failure';
    console.error(`[GeminiService] Error: ${message}`);
    const friendlyError = `\n\n**Agent Error:** ${message}. Check your API quota or key validity.`;
    onChunk(friendlyError);
    return friendlyError;
  }
};
