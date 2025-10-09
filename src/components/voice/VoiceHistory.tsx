import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, User, Copy, Download, Trash2, Clock } from "lucide-react";
import { useVoiceRecording } from "@/hooks/use-voice-conversation";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  action?: string;
}

interface VoiceHistoryProps {
  conversationId?: string;
}

const VoiceHistory: React.FC<VoiceHistoryProps> = ({ conversationId }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  const clearHistory = () => {
    setMessages([]);
  };

  const exportConversation = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadConversationHistory = (id: string) => {
    // Implementation would load from localStorage or API
    console.log("Loading conversation:", id);
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-3 w-3" />;
      case "assistant":
        return <Bot className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "user":
        return "bg-primary text-primary-foreground ml-8";
      case "assistant":
        return "bg-muted text-foreground mr-8";
      case "system":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 mx-4 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Histórico da Conversa</h3>
          <Badge variant="secondary">{messages.length}</Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportConversation}>
            <Download className="h-3 w-3 mr-1" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96 w-full">
        <div className="space-y-3 pr-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conversa ainda.</p>
              <p className="text-sm">Inicie uma conversa com o assistente!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id || index} className="group relative">
                <div className={`p-3 rounded-lg ${getMessageStyle(message.type)}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">{getMessageIcon(message.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-relaxed">{message.content}</div>
                      {message.action && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Ação: {message.action}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.timestamp)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {messages.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground">
            <strong>Dica:</strong> Clique no ícone de cópia para copiar uma mensagem. Use "Exportar"
            para salvar toda a conversa.
          </div>
        </div>
      )}
    </Card>
  );
};

export default VoiceHistory;
