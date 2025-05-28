
import { GoogleGenAI, Chat, GenerateContentResponse, Part, FunctionDeclaration, Tool, GenerateContentConfig } from "@google/genai";
import { AI_MODEL_NAME, AI_SYSTEM_INSTRUCTION } from '../constants';
import { GroundingSource, GeminiGroundingChunk, CreateAppointmentArgs } from '../types';
// addEventToScheduleFromAI is removed as it's no longer directly called by the AI.
// The new flow involves user interaction via the UI.

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY no está configurada. Por favor, asegúrese de que la variable de entorno API_KEY esté configurada.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });

// Function declarations are removed for chat appointment creation.
// If other functions were to be used by the AI, they would be declared here.
const declaredFunctions: FunctionDeclaration[] = [
  // createAppointmentFunctionDeclaration was removed.
];

export const startChat = (customSystemInstruction?: string): Chat => {
  const toolsForChat: Tool[] = [];
  // Only add functionDeclarations tool if there are functions declared.
  if (declaredFunctions.length > 0) {
    toolsForChat.push({ functionDeclarations: declaredFunctions });
  }
  toolsForChat.push({ googleSearch: {} }); // Always add Google Search

  const chatConfig: GenerateContentConfig = {
      systemInstruction: customSystemInstruction || AI_SYSTEM_INSTRUCTION,
      tools: toolsForChat.length > 0 ? toolsForChat : undefined, // Pass tools only if there are any
  };

  return ai.chats.create({
    model: AI_MODEL_NAME,
    config: chatConfig,
  });
};

export const sendMessageStreamToChat = async (
  chat: Chat,
  message: string,
  onChunk: (textChunk: string, sources?: GroundingSource[], isIntermediate?: boolean) => void,
  onDone: (fullResponse: string, sources?: GroundingSource[]) => void, // Modified to pass full response for parsing
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const result = await chat.sendMessageStream({ message });
    let accumulatedText = "";
    let accumulatedSources: GroundingSource[] = [];
    // currentFunctionCall logic is removed as appointment creation is no longer a direct function call

    for await (const chunk of result) {
      // Function call handling removed for appointments. If other function calls were possible, that logic would remain here.
      // For this specific request, we assume appointment was the only function call being handled.
      
      const text = chunk.text;
      if (text) {
          accumulatedText += text;
          const geminiSources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (geminiSources && geminiSources.length > 0) {
            const newSources = mapGeminiSources(geminiSources);
            newSources.forEach(ns => {
              if (!accumulatedSources.some(as => as.uri === ns.uri)) {
                accumulatedSources.push(ns);
              }
            });
          }
          onChunk(text, accumulatedSources.length > 0 ? [...accumulatedSources] : undefined, false);
      }
    }
    // No function call processing block needed here anymore for appointments.
    onDone(accumulatedText, accumulatedSources.length > 0 ? [...accumulatedSources] : undefined);
  } catch (error) {
    console.error("Error enviando mensaje a Gemini:", error);
    onError(error instanceof Error ? error : new Error(String(error)));
    // onDone might not be appropriate here if an error occurs before any text is accumulated.
    // The caller should handle the error state appropriately.
  }
};


export const askOnce = async (
  prompt: string,
  systemInstruction?: string,
  enableThinking: boolean = true,
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || AI_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Only Google Search tool for askOnce
        ...(AI_MODEL_NAME === 'gemini-2.5-flash-preview-04-17' && !enableThinking && { thinkingConfig: { thinkingBudget: 0 } }),
      },
    });

    const text = response.text;
    const geminiSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = geminiSources ? mapGeminiSources(geminiSources) : undefined;
    
    return { text, sources };
  } catch (error) {
    console.error("Error en askOnce:", error);
    throw error;
  }
};

const mapGeminiSources = (geminiChunks: GeminiGroundingChunk[]): GroundingSource[] => {
  return geminiChunks
    .map(chunk => {
      const sourceInfo = chunk.web || chunk.retrievedContext;
      if (sourceInfo && sourceInfo.uri) {
        return {
          uri: sourceInfo.uri,
          title: sourceInfo.title || sourceInfo.uri, 
        };
      }
      return null;
    })
    .filter((source): source is GroundingSource => source !== null);
};

export const analyzeTextWithAI = async (
  textToAnalyze: string,
  analysisPrompt: string = "Eulogio, por favor, analiza la siguiente nota de caso de trabajo social. Proporciona un resumen conciso, identifica posibles fortalezas del cliente, riesgos, necesidades y sugiere 2-3 posibles próximos pasos o consideraciones para el trabajador social. Estructura tu respuesta claramente con encabezados para cada sección (Resumen, Fortalezas, Riesgos, Necesidades, Próximos Pasos/Consideraciones). Nota del Caso:\n"
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  const fullPrompt = `${analysisPrompt}\n\n---\n${textToAnalyze}\n---`;
  // For text analysis, direct function calling isn't typically needed, so system instruction and googleSearch are fine.
  // If specific functions were for analysis, they'd be passed here.
  return askOnce(fullPrompt, AI_SYSTEM_INSTRUCTION);
};
