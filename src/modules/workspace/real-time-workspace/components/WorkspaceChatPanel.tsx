import React, { useState, useRef, useEffect, useCallback } from "react";
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
  MicOff,
  Phone, 
  Video, 
  Bell,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Bot,
  Sparkles,
  Image as ImageIcon,
  MapPin,
  FileUp,
  X,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  type?: "text" | "file" | "image" | "location" | "audio" | "system" | "ai";
  attachmentUrl?: string;
  attachmentName?: string;
}

interface WorkspaceChatPanelProps {
  channelName: string;
  onlineCount: number;
  messages: ChatMessage[];
  onSendMessage: (content: string, type?: ChatMessage["type"], attachment?: File) => void;
  onAIAssist?: (message: string) => void;
  onStartCall?: () => void;
  onStartVideo?: () => void;
  isLoadingAI?: boolean;
}

const EMOJI_LIST = ["😀", "😂", "🥰", "😎", "🤔", "👍", "👎", "❤️", "🔥", "✅", "⚠️", "📍", "🚢", "⚓", "🌊", "⛽"];

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showLocationShare, setShowLocationShare] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage, "text");
    setNewMessage("");
  };

  const handleAIAssist = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Digite uma mensagem",
        description: "O Copilot IA precisa de contexto para ajudar",
      });
      return;
    }
    onAIAssist?.(newMessage);
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      toast({
        title: "Gravação concluída",
        description: `Mensagem de voz de ${formatRecordingTime(recordingTime)} pronta para envio`,
      });
      // Simulate sending audio message
      onSendMessage(`🎤 Mensagem de voz (${formatRecordingTime(recordingTime)})`, "audio");
    } else {
      // Start recording
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        toast({
          title: "Gravando...",
          description: "Fale agora para gravar sua mensagem de voz",
        });
      } catch (error) {
        toast({
          title: "Erro ao acessar microfone",
          description: "Permita o acesso ao microfone para gravar",
          variant: "destructive",
        });
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (type === "image") {
        setShowImageUpload(true);
      } else {
        setShowFileUpload(true);
      }
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile) return;
    
    setIsSendingFile(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fileType = selectedFile.type.startsWith("image/") ? "image" : "file";
      onSendMessage(
        `📎 ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, 
        fileType
      );
      
      toast({
        title: "Arquivo enviado",
        description: selectedFile.name,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar arquivo",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSendingFile(false);
      setSelectedFile(null);
      setShowFileUpload(false);
      setShowImageUpload(false);
    }
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      
      toast({
        title: "Localização obtida",
        description: "Pronta para compartilhar",
      });
    } catch (error) {
      toast({
        title: "Erro ao obter localização",
        description: "Permita o acesso à localização",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleShareLocation = () => {
    if (userLocation) {
      onSendMessage(
        `📍 Localização compartilhada: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
        "location"
      );
      setShowLocationShare(false);
      setUserLocation(null);
      toast({
        title: "Localização compartilhada",
        description: "Sua localização foi enviada para o canal",
      });
    }
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
        {isRecording && (
          <div className="flex items-center gap-3 mb-3 p-2 bg-destructive/10 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Gravando: {formatRecordingTime(recordingTime)}</span>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setIsRecording(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* Attachment dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-background border">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <FileUp className="h-4 w-4 mr-2" />
                Enviar arquivo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Enviar imagem
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLocationShare(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                Compartilhar localização
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={(e) => handleFileSelect(e, "file")}
          />
          <input 
            ref={imageInputRef}
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={(e) => handleFileSelect(e, "image")}
          />
          
          <div className="flex-1 relative">
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="pr-10 bg-muted/50 border-border/50"
              disabled={isRecording}
            />
            
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                  <Smile className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 bg-background border" align="end">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-lg hover:bg-accent"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Copilot AI button */}
          {onAIAssist && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-9 w-9 flex-shrink-0 border-primary/50 hover:bg-primary/10"
                    onClick={handleAIAssist}
                    disabled={isLoadingAI}
                  >
                    {isLoadingAI ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copilot IA - Assistência inteligente</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Voice recording button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isRecording ? "destructive" : "ghost"} 
                  size="icon" 
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleVoiceRecord}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isRecording ? "Parar e enviar" : "Gravar mensagem de voz"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Send button */}
          <Button 
            onClick={handleSend} 
            size="icon" 
            className="h-9 w-9 flex-shrink-0"
            disabled={!newMessage.trim() || isRecording}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Upload Dialog */}
      <Dialog open={showFileUpload || showImageUpload} onOpenChange={(open) => {
        if (!open) {
          setShowFileUpload(false);
          setShowImageUpload(false);
          setSelectedFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showImageUpload ? "Enviar Imagem" : "Enviar Arquivo"}
            </DialogTitle>
            <DialogDescription>
              {selectedFile?.name} ({(selectedFile?.size ?? 0 / 1024).toFixed(1)} KB)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {showImageUpload && selectedFile && (
              <img 
                src={URL.createObjectURL(selectedFile)} 
                alt="Preview" 
                className="max-h-48 rounded-lg object-contain"
              />
            )}
            {showFileUpload && selectedFile && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg w-full">
                <FileUp className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowFileUpload(false);
                setShowImageUpload(false);
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSendFile}
              disabled={isSendingFile}
            >
              {isSendingFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Share Dialog */}
      <Dialog open={showLocationShare} onOpenChange={setShowLocationShare}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar Localização</DialogTitle>
            <DialogDescription>
              Permita o acesso à sua localização para compartilhar com a equipe
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-muted rounded-full">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
            {userLocation ? (
              <div className="text-center">
                <p className="font-medium text-green-600">Localização obtida!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Clique no botão abaixo para obter sua localização atual
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setShowLocationShare(false);
                setUserLocation(null);
              }}
            >
              Cancelar
            </Button>
            {userLocation ? (
              <Button className="flex-1" onClick={handleShareLocation}>
                <Send className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            ) : (
              <Button 
                className="flex-1"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Obtendo...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Obter Localização
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkspaceChatPanel;
