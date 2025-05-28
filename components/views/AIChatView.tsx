
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat } from "@google/genai";
import { startChat, sendMessageStreamToChat } from '../../services/geminiService';
import { ChatMessage, GroundingSource, CreateAppointmentArgs, EventType, CreateTaskArgs } from '../../types'; // Added CreateTaskArgs
import { usePendingAppointment } from '../../contexts/PendingAppointmentContext';
import { usePendingTask } from '../../contexts/PendingTaskContext'; // Added
import LoadingSpinner from '../LoadingSpinner';
import { AI_SYSTEM_INSTRUCTION } from '../../constants';
import PlusIcon from '../icons/PlusIcon';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-theme-text-inverted bg-theme-accent-primary rounded-full p-1">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const BotIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-theme-text-inverted bg-secondary rounded-full p-1">
    <path d="M12 .75a8.25 8.25 0 00-8.25 8.25c0 2.154.834 4.157 2.246 5.662A7.46 7.46 0 0012 20.25a7.46 7.46 0 005.983-2.588A8.223 8.223 0 0020.25 9 8.25 8.25 0 0012 .75zM9.662 12.81a.75.75 0 00-1.06 0 2.25 2.25 0 000 3.182.75.75 0 001.06-1.06 2.242 2.242 0 00-.188-2.122zM12 11.25a.75.75 0 000 1.5h.005a.75.75 0 000-1.5H12zm2.528 1.56a.75.75 0 001.06 0 2.25 2.25 0 000-3.182.75.75 0 10-1.06 1.06c.063.062.11.132.14.203a.756.756 0 01-.14.202l-.001.001a.755.755 0 01-.139-.202c-.03-.07-.077-.14-.14-.203a.75.75 0 10-1.06 1.06 2.25 2.25 0 003.182 0 .75.75 0 00-1.06-1.06c-.063-.062-.11-.132-.14-.203a.756.756 0 01.14-.202l.001-.001a.755.755 0 01.139.202c.03.07.077.14.14.203zM12 5.25a.75.75 0 00-.75.75v.005a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75z"/>
    <path fillRule="evenodd" d="M12 22.5a1.5 1.5 0 001.5-1.5v-1.383c.48-.065.948-.153 1.397-.266A1.5 1.5 0 0016.5 18v-1.5a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 007.5 16.5V18a1.5 1.5 0 001.103 1.451c.45.113.918.201 1.397.266V21a1.5 1.5 0 001.5 1.5z" clipRule="evenodd" />
 </svg>
);

const parseAppointmentJson = (responseText: string): CreateAppointmentArgs | null => {
  const regex = /```json_appointment\s*([\s\S]*?)\s*```/;
  const match = responseText.match(regex);
  if (match && match[1]) {
    try {
      const jsonData = JSON.parse(match[1]);
      if (jsonData.title && jsonData.startDateTime && jsonData.endDateTime) {
        if (jsonData.eventType && !Object.values(EventType).includes(jsonData.eventType as EventType)) {
            console.warn(`Invalid eventType '${jsonData.eventType}' provided by AI. Defaulting or ignoring.`);
            delete jsonData.eventType; 
        }
        return jsonData as CreateAppointmentArgs;
      }
    } catch (e) {
      console.error("Error parsing appointment JSON from AI:", e);
    }
  }
  return null;
};

const parseTaskJson = (responseText: string): CreateTaskArgs | null => {
  const regex = /```json_task\s*([\s\S]*?)\s*```/;
  const match = responseText.match(regex);
  if (match && match[1]) {
    try {
      const jsonData = JSON.parse(match[1]);
      // Basic validation: title is mandatory for a task
      if (jsonData.title) {
        return jsonData as CreateTaskArgs;
      }
    } catch (e) {
      console.error("Error parsing task JSON from AI:", e);
    }
  }
  return null;
};


const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setPendingAppointment } = usePendingAppointment();
  const { setPendingTask } = usePendingTask(); // Added

  useEffect(() => {
    const newChat = startChat(AI_SYSTEM_INSTRUCTION);
    setChatSession(newChat);
    setMessages([
      {
        id: 'initial-bot-message',
        role: 'assistant',
        content: "¡Hola! Soy Eulogio, tu asistente de IA. ¿En qué puedo ayudarte hoy? Puedes pedirme información, sugerencias de recursos, ayuda para redactar, programar citas o crear tareas. Recuerda usar tu juicio profesional y verificar la información crítica.",
        timestamp: new Date(),
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !chatSession || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { 
        id: assistantMessageId, 
        role: 'assistant', 
        content: '', 
        timestamp: new Date(), 
        isLoading: true,
        sources: []
    }]);

    await sendMessageStreamToChat(
      chatSession,
      userMessage.content,
      (textChunk, sources) => { 
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + textChunk, sources: sources || msg.sources, isLoading: true }
              : msg
          )
        );
      },
      (fullResponse, sources) => { 
        const suggestedAppointment = parseAppointmentJson(fullResponse);
        const suggestedTask = parseTaskJson(fullResponse); // Parse for task
        setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  isLoading: false, 
                  content: fullResponse, 
                  sources: sources || msg.sources, 
                  suggestedAppointment,
                  suggestedTask // Add suggested task to message
                } 
              : msg
            )
          );
        setIsLoading(false);
      },
      (err) => { 
        setError(`Error de Eulogio: ${err.message}. Revisa tu clave API y la conexión de red.`);
        setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: `Lo siento, he encontrado un error: ${err.message}`, isLoading: false, role: 'assistant' }
                : msg
            )
          );
        setIsLoading(false);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, chatSession, isLoading]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const newChat = startChat(AI_SYSTEM_INSTRUCTION);
    setChatSession(newChat);
    setMessages([
      {
        id: 'cleared-chat-message',
        role: 'assistant',
        content: "Chat reiniciado. ¿Cómo puedo ayudarte ahora?",
        timestamp: new Date(),
      }
    ]);
    setError(null);
    setIsLoading(false);
  };

  const handleAddAppointmentToSchedule = (appointmentData: CreateAppointmentArgs) => {
    setPendingAppointment(appointmentData);
    navigate('/schedule');
  };

  const handleAddTaskToList = (taskData: CreateTaskArgs) => {
    setPendingTask(taskData);
    navigate('/tasks');
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] bg-theme-bg-secondary shadow-xl rounded-lg overflow-hidden">
      <header className="p-4 border-b border-theme-border-secondary bg-theme-bg-card flex justify-between items-center">
        <h2 className="text-xl font-semibold text-theme-text-accent">Asistente IA (Eulogio)</h2>
        <button
            onClick={handleClearChat}
            className="px-4 py-2 text-sm font-medium text-theme-accent-primary border border-theme-accent-primary rounded-md hover:bg-theme-accent-primary hover:text-theme-text-inverted transition-colors"
          >
            Limpiar Chat
          </button>
      </header>

      <div className="flex-grow p-6 space-y-4 overflow-y-auto bg-theme-bg-primary">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-xl lg:max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 mx-2">
                {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
              </div>
              <div className={`p-4 rounded-xl shadow ${msg.role === 'user' ? 'bg-theme-accent-primary text-theme-text-inverted rounded-br-none' : 'bg-theme-bg-card text-theme-text-primary rounded-bl-none'}`}>
                {msg.isLoading && msg.content === '' ? (
                  <LoadingSpinner size="sm" color={msg.role === 'user' ? "text-theme-text-inverted" : "text-theme-accent-primary"} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content
                        .replace(/```json_appointment\s*[\s\S]*?\s*```/, '')
                        .replace(/```json_task\s*[\s\S]*?\s*```/, '')
                        .trim()}
                  </p>
                )}
                 {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-theme-border-secondary">
                    <h4 className="text-xs font-semibold mb-1 text-theme-text-secondary">Fuentes:</h4>
                    <ul className="space-y-1">
                      {msg.sources.map((source, index) => (
                        <li key={index} className="text-xs">
                          <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title={source.title}
                            className="text-theme-text-accent hover:underline truncate block max-w-xs"
                          >
                            {index+1}. {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {msg.role === 'assistant' && msg.suggestedAppointment && !msg.isLoading && (
                  <div className="mt-3 pt-3 border-t border-theme-border-secondary">
                    <button
                      onClick={() => handleAddAppointmentToSchedule(msg.suggestedAppointment!)}
                      className="w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-theme-accent-primary text-theme-text-inverted rounded-md hover:bg-theme-accent-primary-dark transition-colors shadow"
                    >
                      <PlusIcon className="w-4 h-4 mr-1.5" />
                      Añadir a Agenda
                    </button>
                  </div>
                )}
                {msg.role === 'assistant' && msg.suggestedTask && !msg.isLoading && (
                  <div className={`mt-3 pt-3 ${msg.suggestedAppointment ? '' : 'border-t border-theme-border-secondary'}`}>
                    <button
                      onClick={() => handleAddTaskToList(msg.suggestedTask!)}
                      className="w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-secondary text-theme-text-inverted rounded-md hover:opacity-80 transition-colors shadow" // Using secondary color for differentiation
                    >
                      <PlusIcon className="w-4 h-4 mr-1.5" />
                      Añadir a Tareas
                    </button>
                  </div>
                )}
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200 opacity-80' : 'text-theme-text-secondary opacity-80 text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {error && <p className="p-4 text-sm text-red-600 bg-red-100 border-t border-red-300">{error}</p>}

      <div className="p-4 border-t border-theme-border-secondary bg-theme-bg-card">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Pregúntale a Eulogio..."
            className="flex-grow p-3 border border-theme-border-primary rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent resize-none min-h-[48px] max-h-40"
            rows={1}
            disabled={isLoading}
            aria-label="Escribe tu mensaje a Eulogio"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-semibold hover:bg-theme-button-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensaje"
          >
            {isLoading ? <LoadingSpinner size="sm" color="text-theme-button-primary-text"/> : 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatView;
