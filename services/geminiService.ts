
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Streams a multi-turn conversation response from the Gemini 3 Pro model.
 * 
 * This service applies the Atlas system instructions to ensure the model behaves
 * as a multi-agent orchestrator. It handles history conversion to the format 
 * required by the Google GenAI SDK and manages error states gracefully by 
 * streaming a friendly error message back to the UI.
 *
 * @param {string} query - The current user prompt or command.
 * @param {Array<{role: 'user' | 'assistant', content: string}>} history - Previous turns in the conversation.
 * @param {(chunk: string) => void} onChunk - Callback function invoked for each piece of streamed text.
 * @returns {Promise<string>} The full accumulated response string once streaming is complete.
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
