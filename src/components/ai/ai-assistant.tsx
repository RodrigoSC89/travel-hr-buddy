import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Lightbulb,
  TrendingUp,
  FileText,
  Settings,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Extend the global Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: string[];
    actions?: Array<{
      label: string;
      action: string;
      data?: any;
    }>;
  };
}

interface AIAssistantProps {
  context?: string;
  module?: string;
  onAction?: (action: string, data?: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  context = "general",
  module = "dashboard",
  onAction
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "pt-BR";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Erro no reconhecimento de voz",
          description: "Não foi possível capturar o áudio",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }

    // Add welcome message
    setMessages([{
      id: "1",
      type: "assistant",
      content: `Olá! Sou seu assistente inteligente para o módulo ${module}. Como posso ajudá-lo hoje?`,
      timestamp: new Date(),
      metadata: {
        suggestions: [
          "Gerar relatório de desempenho",
          "Analisar métricas do sistema",
          "Sugerir otimizações",
          "Verificar notificações"
        ]
      }
    }]);
  }, [module, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Recurso não disponível",
        description: "Reconhecimento de voz não é suportado neste navegador",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the AI chat edge function
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: userMessage.content,
          context,
          module,
          user_id: user?.id,
          conversation_history: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Execute any actions returned by the AI
      if (data.actions && data.actions.length > 0) {
        data.actions.forEach((action: any) => {
          if (onAction) {
            onAction(action.action, action.data);
          }
        });
      }

    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no assistente",
        description: "Não foi possível processar sua mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleActionClick = (action: string, data?: any) => {
    if (onAction) {
      onAction(action, data);
    }
    
    toast({
      title: "Ação executada",
      description: `${action} foi executado com sucesso`,
    });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === "user";
    const isSystem = message.type === "system";

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : 
            isSystem ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
        }`}>
          {isUser ? <User className="w-4 h-4" /> : 
            isSystem ? <Settings className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        
        <div className={`flex-1 ${isUser ? "text-right" : ""}`}>
          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
            isUser ? "bg-primary text-primary-foreground" : 
              isSystem ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString("pt-BR", { 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </p>

          {/* Render suggestions */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.metadata.suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}

          {/* Render actions */}
          {message.metadata?.actions && message.metadata.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.metadata.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(action.action, action.data)}
                  className="h-8"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Assistente IA
          <Badge variant="outline" className="ml-auto">
            {module}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-3 rounded-lg bg-accent text-accent-foreground">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem ou use o microfone..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={isListening ? "bg-status-error text-status-error-foreground" : ""}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};