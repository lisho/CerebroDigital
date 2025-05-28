
// Import necessary types from @google/genai, but not the GenAI object itself for making calls
import { Content, Part, GenerateContentResponse, GenerateContentConfig } from "@google/genai"; 
import { AI_MODEL_NAME, AI_SYSTEM_INSTRUCTION } from '../constants';
import { GroundingSource, GeminiGroundingChunk } from '../types';
// CreateAppointmentArgs is removed as it's related to function calling not directly used here anymore.

// The API key is no longer handled by the frontend.
// The GoogleGenAI instance for direct calls is removed.

const PROXY_URL = 'http://localhost:3001/api/v1/chat/send'; // Make this an env var in a real app: VITE_PROXY_URL

// Client-side representation of a chat session
export interface ClientChat {
  history: Content[];
  config: {
    systemInstruction?: string | Part | (string | Part)[]; // Adjusted to match GenerateContentConfig['systemInstruction']
  };
  // Method to add messages to history, can be expanded
  addMessage: (role: 'user' | 'model', text: string) => void;
}


export const startChat = (customSystemInstruction?: string): ClientChat => {
  const initialHistory: Content[] = [];
  
  // The system instruction from the proxy might be slightly different in how it's applied.
  // The proxy server.js currently prepends a system instruction to the history if provided.
  // This client-side object will just store it for sending.
  const chatConfig = {
      systemInstruction: customSystemInstruction || AI_SYSTEM_INSTRUCTION,
      // Tools are now handled by the proxy if configured there.
      // Client doesn't need to specify tools like googleSearch directly to Gemini via proxy.
  };

  return {
    history: initialHistory,
    config: chatConfig,
    addMessage: function(role: 'user' | 'model', text: string) {
      this.history.push({ role, parts: [{ text }] });
    }
  };
};

export const sendMessageStreamToChat = async (
  chat: ClientChat, // Updated to use ClientChat
  message: string,
  onChunk: (textChunk: string, sources?: GroundingSource[], isIntermediate?: boolean) => void,
  onDone: (fullResponse: string, sources?: GroundingSource[]) => void,
  onError: (error: Error) => void
): Promise<void> => {
  let accumulatedText = "";
  // Sources are not currently sent by the proxy stream per chunk.
  // This might need adjustment if the proxy is updated to send sources during streaming.
  const accumulatedSources: GroundingSource[] = []; 

  try {
    const requestBody = {
      message,
      history: chat.history,
      systemInstruction: chat.config.systemInstruction,
      stream: true,
    };

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok || !response.body) {
      const errorText = response.body ? await response.text() : 'No response body';
      throw new Error(`Proxy error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const streamChunk = decoder.decode(value, { stream: true });
      const lines = streamChunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(5);
          if (jsonStr.trim() === '{"event":"STREAM_END"}') {
            // Stream finished successfully from proxy's perspective
            reader.cancel(); // Ensure reader is cancelled
            onDone(accumulatedText, accumulatedSources.length > 0 ? [...accumulatedSources] : undefined);
            return; 
          }
          try {
            const parsedChunk = JSON.parse(jsonStr);
            if (parsedChunk.text) {
              accumulatedText += parsedChunk.text;
              // Currently, proxy does not send sources in stream chunks.
              // If it did, they would be processed here and added to accumulatedSources.
              onChunk(parsedChunk.text, undefined, false); // No sources per chunk from proxy for now
            } else if (parsedChunk.error) {
              // Handle error message sent via stream by proxy
              console.error("Error from proxy stream:", parsedChunk.error);
              onError(new Error(`Proxy stream error: ${parsedChunk.error}`));
              reader.cancel();
              return;
            }
          } catch (e) {
            // This might be a partial JSON if a chunk splits a data line.
            // More robust parsing might be needed for production (e.g. accumulating buffer)
            console.warn("Error parsing stream chunk from proxy, might be partial:", jsonStr, e);
          }
        }
      }
    }
    // If loop finishes without STREAM_END, it might be an unexpected close.
    onDone(accumulatedText, accumulatedSources.length > 0 ? [...accumulatedSources] : undefined);

  } catch (error) {
    console.error("Error sending message via proxy:", error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
};


export const askOnce = async (
  prompt: string,
  systemInstruction?: string,
  // enableThinking is a Gemini-specific param, proxy might not support it directly
  // For now, it's removed. If needed, proxy would have to implement logic for it.
  // enableThinking: boolean = true, 
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  try {
    const requestBody = {
      message: prompt,
      systemInstruction: systemInstruction || AI_SYSTEM_INSTRUCTION,
      stream: false,
      // tools: [{ googleSearch: {} }] // Tools are handled by proxy if at all
    };

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    // Assuming proxy returns { text: string, sources?: GroundingSource[] }
    // The current proxy returns { text: string }. Sources need to be added to proxy if required.
    // For now, we adapt to { text: string } and sources will be undefined.
    return { text: data.text, sources: data.sources || undefined };

  } catch (error) {
    console.error("Error in askOnce via proxy:", error);
    if (error instanceof Error && error.message.includes("Proxy error:")) {
      throw error;
    }
    throw new Error(`Failed to fetch from proxy: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// mapGeminiSources is still useful if the proxy returns sources in the Gemini format.
// However, the current proxy's non-streaming response for /api/v1/chat/send only returns `text`.
// If the proxy were to return raw `GenerateContentResponse.candidates[0].groundingMetadata.groundingChunks`,
// then this function would be used. For now, it might be unused if proxy only sends simplified sources.
// Let's assume for now the proxy might send sources in a compatible format for `askOnce`.
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
  // systemInstruction for analyzeTextWithAI will use the default AI_SYSTEM_INSTRUCTION
  // as askOnce is now responsible for setting it.
  return askOnce(fullPrompt, AI_SYSTEM_INSTRUCTION);
};
