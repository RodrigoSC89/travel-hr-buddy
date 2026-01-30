/**
 * Weather AI Chat - Contextual Weather Assistant
 * PATCH WINDY-1.0
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, CurrentWeather, DailyForecast, MarineData, WeatherLocation } from "./types";

interface WeatherChatProps {
  location: WeatherLocation;
  weather: CurrentWeather | null;
  forecast: DailyForecast[];
  marine?: MarineData | null;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const QUICK_PROMPTS = [
  "Por que está chovendo?",
  "Quando vai melhorar o tempo?",
  "Melhor hora para ir à praia?",
  "Qual roupa devo usar?",
  "Há algum aviso importante?",
];

export const WeatherChat: React.FC<WeatherChatProps> = ({
  location,
  weather,
  forecast,
  marine,
  isOpen = true,
  onClose,
  className
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build weather context for AI
  const buildWeatherContext = () => {
    let context = `Localização: ${location.name} (Lat: ${location.lat}, Lon: ${location.lon})\n`;
    
    if (weather) {
      context += `\nCondições Atuais:\n`;
      context += `- Temperatura: ${weather.temperature}°C (Sensação: ${weather.feelsLike}°C)\n`;
      context += `- Condição: ${weather.description}\n`;
      context += `- Umidade: ${weather.humidity}%\n`;
      context += `- Vento: ${weather.wind.speed} kt, direção ${weather.wind.direction}°\n`;
      context += `- Rajadas: ${weather.wind.gust} kt\n`;
      context += `- Visibilidade: ${weather.visibility} km\n`;
      context += `- Pressão: ${weather.pressure} hPa\n`;
      context += `- Índice UV: ${weather.uvIndex}\n`;
    }

    if (forecast.length > 0) {
      context += `\nPrevisão dos próximos ${forecast.length} dias:\n`;
      forecast.forEach((day, i) => {
        context += `- ${day.dayOfWeek}: ${day.tempMin}°/${day.tempMax}°C, ${day.condition}, chuva ${day.rainProbability}%\n`;
      });
    }

    if (marine) {
      context += `\nCondições Marítimas:\n`;
      context += `- Altura das ondas: ${marine.waveHeight}m\n`;
      context += `- Período das ondas: ${marine.wavePeriod}s\n`;
      context += `- Temperatura da água: ${marine.waterTemperature}°C\n`;
      context += `- Maré: ${marine.tideType} (${marine.tideLevel}cm)\n`;
    }

    return context;
  };

  // Send message to AI
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const weatherContext = buildWeatherContext();
      
      const { data, error } = await supabase.functions.invoke('weather-ai-chat', {
        body: {
          message: messageText,
          context: weatherContext,
          location: location.name,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || "Desculpe, não consegui processar sua pergunta. Tente novamente.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[WeatherChat] Error:', err);
      
      // PATCH iOS PWA: Mensagem genérica sem mencionar "conexão"
      let fallbackContent = "Desculpe, ocorreu um erro ao processar sua pergunta. ";
      
      if (weather) {
        fallbackContent += `Posso informar que em ${location.name} agora: **${Math.round(weather.temperature)}°C**, ${weather.description}. `;
        fallbackContent += `Vento de ${Math.round(weather.wind.speed)} nós. `;
        
        if (weather.humidity > 70) {
          fallbackContent += "🌧️ Umidade alta, considere levar guarda-chuva!";
        } else if (weather.temperature > 28) {
          fallbackContent += "☀️ Dia quente, use protetor solar e hidrate-se!";
        } else if (weather.temperature < 18) {
          fallbackContent += "🧥 Temperatura amena, leve um casaco.";
        } else {
          fallbackContent += "✅ Condições agradáveis para atividades ao ar livre.";
        }
      } else {
        fallbackContent += "Tente novamente em alguns instantes.";
      }
      
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: weather 
          ? `Olá! 👋 Sou seu assistente meteorológico para ${location.name}. Atualmente ${Math.round(weather.temperature)}°C com ${weather.description}. Pergunte sobre clima, roupas, atividades ao ar livre ou previsão!`
          : `Olá! 👋 Sou seu assistente meteorológico para ${location.name}. Carregando dados do clima... Enquanto isso, pode fazer perguntas!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      console.log('[WeatherChat] Welcome message set');
    }
  }, [weather, location.name, messages.length]);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "flex flex-col bg-slate-900/95 backdrop-blur-lg border-l border-white/10 h-full",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Assistente IA</h3>
            <span className="text-xs text-white/50">Meteorologia inteligente</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-white"
                )}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white/70" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-white/50 text-sm">
                Analisando dados meteorológicos...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-white/50 mb-2">Perguntas sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-white/10 text-white/70 border-white/20"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Pergunte sobre o clima..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            disabled={isLoading}
          />
          <Button 
            onClick={() => sendMessage(input)} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeatherChat;
