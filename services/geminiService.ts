
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Streams a multi-turn conversation response from the Gemini 3 Pro model.
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

/**
 * Uses Gemini to analyze a GitHub repository URL and predict its structure and architecture.
 * This returns a structured JSON object for the UI to consume.
 */
export const analyzeGithubRepo = async (repoUrl: string) => {
  const prompt = `Perform a deep architectural audit and structure prediction for the following GitHub repository: ${repoUrl}. 
  
  As the Atlas Architect and Explorer agents, you must:
  1. Identify the likely tech stack (core languages, frameworks, and libraries).
  2. Synthesize a high-level architectural overview (e.g., Clean Architecture, Micro-frontends, Layered Mono-repo).
  3. Predict the most important top-level directories and their significant immediate children (1 level deep).
  4. Highlight the primary entry points and critical business logic locations.
  
  Return the analysis in a clean JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            repoName: { type: Type.STRING },
            summary: { type: Type.STRING, description: 'Markdown formatted architectural summary' },
            stack: { type: Type.ARRAY, items: { type: Type.STRING } },
            structure: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'file or directory' },
                  path: { type: Type.STRING },
                  children: { 
                    type: Type.ARRAY, 
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        path: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ['name', 'type', 'path']
              }
            }
          },
          required: ['repoName', 'summary', 'stack', 'structure']
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data;
  } catch (error) {
    console.error('[GeminiService] Repo Analysis Error:', error);
    throw error;
  }
};
