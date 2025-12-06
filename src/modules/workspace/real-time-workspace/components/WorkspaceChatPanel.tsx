import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  Send, 
  Mic, 
  Phone, 
  Video, 
  Bell,
  Smile,
  Paperclip,
  MoreHorizontal,
  Check,
  CheckCheck,
  Bot,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isAI?: boolean;
  status?: "sent" | "delivered" | "read";
  type?: "text" | "file" | "system" | "ai";
}

interface WorkspaceChatPanelProps {
  channelName: string;
  onlineCount: number;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onAIAssist?: (message: string) => void;
  onStartCall?: () => void;
  onStartVideo?: () => void;
  isLoadingAI?: boolean;
}

export const WorkspaceChatPanel: React.FC<WorkspaceChatPanelProps> = ({
  channelName,
  onlineCount,
  messages,
  onSendMessage,
  onAIAssist,
  onStartCall,
  onStartVideo,
  isLoadingAI = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleAIAssist = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Digite uma mensagem",
        description: "A IA precisa de uma mensagem para assistir",
      });
      return;
    }
    onAIAssist?.(newMessage);
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Gravação parada" : "Gravando...",
      description: isRecording ? "Mensagem de voz pronta" : "Fale agora para gravar sua mensagem",
    });
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-base"># {channelName}</h3>
              <p className="text-xs text-muted-foreground">{onlineCount} membros online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStartCall}>
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Iniciar chamada de voz</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStartVideo}>
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Iniciar videochamada</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configurar notificações</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback className={`text-xs ${message.isAI ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground" : ""}`}>
                    {message.isAI ? <Bot className="h-4 w-4" /> : message.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`max-w-[75%] ${message.isOwn ? "items-end" : ""}`}>
                  <div className={`flex items-center gap-2 mb-1 ${message.isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-sm font-medium flex items-center gap-1">
                      {message.isAI && <Sparkles className="h-3 w-3 text-primary" />}
                      {message.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-2xl ${
                      message.isAI 
                        ? "bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20" 
                        : message.isOwn 
                          ? "bg-primary text-primary-foreground rounded-br-sm" 
                          : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.isOwn && message.status && (
                    <div className="flex justify-end mt-1">
                      {message.status === "read" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-primary" />
                      ) : message.status === "delivered" ? (
                        <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoadingAI && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Enviar arquivo</DropdownMenuItem>
              <DropdownMenuItem>Enviar imagem</DropdownMenuItem>
              <DropdownMenuItem>Compartilhar localização</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="pr-10 bg-muted/50 border-border/50"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <Smile className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          
          {onAIAssist && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 flex-shrink-0 border-primary/50"
                    onClick={handleAIAssist}
                    disabled={isLoadingAI}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Assistência IA</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isRecording ? "destructive" : "ghost"} 
                  size="icon" 
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleVoiceRecord}
                >
                  <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isRecording ? "Parar gravação" : "Gravar mensagem de voz"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button onClick={handleSend} size="icon" className="h-9 w-9 flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkspaceChatPanel;
