/**
 * PATCH 132.0 - Mission Copilot Panel
 * AI contextual assistant embedded in Mission Control module
 * 
 * Features:
 * - Real-time operational assistance
 * - Mission status analysis
 * - Suggested actions (start/stop mission, create log, send alert)
 * - Mission summary report generation
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAIAssistant } from "@/ai/hooks/useAIAssistant";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Loader2, 
  FileText, 
  AlertCircle,
  PlayCircle,
  StopCircle,
  FileWarning,
  Send
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MissionCopilotPanelProps {
  missionStatus?: {
    active: boolean;
    name?: string;
    startTime?: string;
    incidents?: number;
    alerts?: number;
  };
  onAction?: (action: string, data?: any) => void;
}

export default function MissionCopilotPanel({ missionStatus, onAction }: MissionCopilotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { toast } = useToast();
  
  const { ask, loading, error, clearError } = useAIAssistant('mission-control', {
    additionalContext: missionStatus
  });

  useEffect(() => {
    // Initial greeting
    if (messages.length === 0) {
      setMessages([{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '🚢 Olá! Sou o Mission Copilot, seu assistente operacional. Como posso ajudar com o controle da missão atual?',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro no AI Assistant",
        description: error
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await ask(input);
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error asking AI assistant:', err);
    }
  };

  const handleSuggestedAction = async (action: string) => {
    let question = "";
    
    switch (action) {
      case "status":
        question = "Qual é o status atual da missão? Há algum ponto de atenção?";
        break;
      case "start-mission":
        question = "O que preciso verificar antes de iniciar uma nova missão?";
        if (onAction) onAction('start-mission');
        break;
      case "stop-mission":
        question = "Quais são os procedimentos para encerrar a missão atual?";
        if (onAction) onAction('stop-mission');
        break;
      case "create-log":
        question = "Que informações são importantes para registrar em um log de missão?";
        if (onAction) onAction('create-log');
        break;
      case "send-alert":
        question = "Em quais situações devo enviar um alerta operacional?";
        if (onAction) onAction('send-alert');
        break;
    }

    if (question) {
      setInput(question);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const generateMissionSummary = async () => {
    setIsGeneratingSummary(true);
    
    try {
      const summaryPrompt = `Gere um resumo executivo da missão atual com base nestes dados:
        - Status: ${missionStatus?.active ? 'Ativa' : 'Inativa'}
        - Nome: ${missionStatus?.name || 'Não especificado'}
        - Início: ${missionStatus?.startTime || 'Não especificado'}
        - Incidentes: ${missionStatus?.incidents || 0}
        - Alertas: ${missionStatus?.alerts || 0}
        
        Inclua:
        1. Status geral
        2. Pontos críticos
        3. Recomendações
        4. Próximos passos`;

      const summary = await ask(summaryPrompt);
      
      const summaryMessage: Message = {
        id: `msg-${Date.now()}-summary`,
        role: 'assistant',
        content: `📊 **RESUMO DA MISSÃO**\n\n${summary}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, summaryMessage]);
      
      toast({
        title: "Resumo Gerado",
        description: "O resumo da missão foi gerado com sucesso."
      });
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mission Copilot
            </CardTitle>
            <CardDescription>
              Assistente IA para operações de missão
            </CardDescription>
          </div>
          {missionStatus && (
            <Badge variant={missionStatus.active ? "default" : "secondary"}>
              {missionStatus.active ? "Missão Ativa" : "Standby"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Suggested Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Ações Sugeridas:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestedAction('status')}
              disabled={loading}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestedAction('start-mission')}
              disabled={loading}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Iniciar Missão
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestedAction('stop-mission')}
              disabled={loading}
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Encerrar Missão
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSuggestedAction('create-log')}
              disabled={loading}
            >
              <FileWarning className="h-4 w-4 mr-1" />
              Criar Log
            </Button>
          </div>
        </div>

        <Separator />

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Faça uma pergunta sobre a missão..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()}
              size="icon"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button
            className="w-full"
            variant="secondary"
            onClick={generateMissionSummary}
            disabled={isGeneratingSummary || loading}
          >
            {isGeneratingSummary ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Gerar Resumo da Missão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
