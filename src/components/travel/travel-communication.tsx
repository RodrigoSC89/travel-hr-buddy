import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Phone,
  Video,
  Plus,
  Search,
  Users,
  MessageSquare,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCheck,
  Check,
  Plane,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: "text" | "file" | "location" | "travel-update" | "system";
  read: boolean;
  metadata?: any;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
  role?: string;
  lastSeen?: Date;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group" | "travel-team";
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  relatedTrip?: string;
}

export const TravelCommunication = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeChat, setActiveChat] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUsersList, setShowUsersList] = useState(false);

  // Mock data
  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: "travel-team-1",
      name: "Equipe Rio de Janeiro",
      type: "travel-team",
      participants: [
        { id: "1", name: "João Silva", status: "online", role: "Coordenador" },
        { id: "2", name: "Maria Santos", status: "online", role: "Analista" },
        { id: "3", name: "Pedro Costa", status: "away", role: "Financeiro" },
      ],
      unreadCount: 3,
      isPinned: true,
      relatedTrip: "Viagem Corporativa - Rio 2024",
    },
    {
      id: "direct-1",
      name: "Ana Ferreira",
      type: "direct",
      participants: [
        { id: "4", name: "Ana Ferreira", status: "online", role: "Agente de Viagens" },
      ],
      unreadCount: 1,
      isPinned: false,
    },
    {
      id: "group-1",
      name: "Planejamento Q1",
      type: "group",
      participants: [
        { id: "5", name: "Carlos Lima", status: "offline", role: "Gerente" },
        { id: "6", name: "Lucia Oliveira", status: "busy", role: "Coordenadora" },
        { id: "7", name: "Roberto Silva", status: "online", role: "Analista" },
      ],
      unreadCount: 0,
      isPinned: true,
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderId: "1",
      senderName: "João Silva",
      content: "Pessoal, acabei de confirmar o hotel no Copacabana. Check-in às 15h.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "text",
      read: true,
    },
    {
      id: "2",
      senderId: "2",
      senderName: "Maria Santos",
      content: "Perfeito! O voo está confirmado para 8h. Vou enviar os boarding passes.",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      type: "text",
      read: true,
    },
    {
      id: "3",
      senderId: "system",
      senderName: "Sistema",
      content: "Voo LATAM 8439 - Portão alterado para B12. Embarque em 1 hora.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "travel-update",
      read: false,
      metadata: {
        updateType: "flight",
        flightNumber: "LATAM 8439",
        gate: "B12",
      },
    },
    {
      id: "4",
      senderId: "3",
      senderName: "Pedro Costa",
      content: "Orçamento aprovado para as refeições. Limite de R$ 150 por pessoa/dia.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: "text",
      read: false,
    },
    {
      id: "5",
      senderId: "1",
      senderName: "João Silva",
      content: "Ótimo! Vamos nos encontrar no saguão do aeroporto às 7h30.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "text",
      read: false,
    },
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      senderName: "Você",
      content: messageInput,
      timestamp: new Date(),
      type: "text",
      read: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");

    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada com sucesso.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "away":
        return "Ausente";
      case "busy":
        return "Ocupado";
      default:
        return "Offline";
    }
  };

  const renderChatList = () => (
    <div className="w-80 border-r bg-muted/30">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Conversas</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowUsersList(!showUsersList)}>
              <Users className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-2 space-y-1">
          {chatRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setActiveChat(room.id)}
              className={cn(
                "p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                activeChat === room.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {room.type === "group" || room.type === "travel-team" ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        room.name.substring(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {room.type === "direct" && (
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                        getStatusColor(room.participants[0]?.status || "offline")
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{room.name}</p>
                    {room.unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {room.type === "travel-team" && room.relatedTrip && (
                    <p className="text-xs text-muted-foreground truncate">{room.relatedTrip}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {room.participants.length} participante
                    {room.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderMessageBubble = (message: ChatMessage) => {
    const isCurrentUser = message.senderId === "current-user";
    const isSystem = message.senderId === "system";

    if (message.type === "travel-update") {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <Plane className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Atualização de Viagem</span>
            </div>
            <p className="text-sm text-blue-800">{message.content}</p>
            <p className="text-xs text-blue-600 mt-1">
              {format(message.timestamp, "HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("flex mb-4", isCurrentUser ? "justify-end" : "justify-start")}>
        <div className={cn("flex gap-2 max-w-[70%]", isCurrentUser && "flex-row-reverse")}>
          {!isCurrentUser && !isSystem && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {message.senderName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              "rounded-lg px-3 py-2",
              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {!isCurrentUser && !isSystem && (
              <p className="text-xs font-medium mb-1">{message.senderName}</p>
            )}
            <p className="text-sm">{message.content}</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <p
                className={cn(
                  "text-xs",
                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {format(message.timestamp, "HH:mm", { locale: ptBR })}
              </p>
              {isCurrentUser && (
                <div className="text-primary-foreground/70">
                  {message.read ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChatArea = () => {
    const currentRoom = chatRooms.find(room => room.id === activeChat);

    if (!currentRoom) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Selecione uma conversa</h3>
            <p className="text-muted-foreground">Escolha uma conversa para começar a mensagem</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {currentRoom.type === "group" || currentRoom.type === "travel-team" ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    currentRoom.name.substring(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{currentRoom.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {currentRoom.type === "direct" ? (
                    <>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(currentRoom.participants[0]?.status || "offline")
                        )}
                      />
                      <span>{getStatusText(currentRoom.participants[0]?.status || "offline")}</span>
                    </>
                  ) : (
                    <span>{currentRoom.participants.length} participantes</span>
                  )}
                  {currentRoom.relatedTrip && (
                    <>
                      <span>•</span>
                      <span>{currentRoom.relatedTrip}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(message => renderMessageBubble(message))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Digite sua mensagem..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && sendMessage()}
                className="pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={sendMessage} disabled={!messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersList = () => {
    if (!showUsersList) return null;

    const currentRoom = chatRooms.find(room => room.id === activeChat);
    if (!currentRoom) return null;

    return (
      <div className="w-64 border-l bg-muted/20">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Participantes</h3>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="p-2 space-y-2">
            {currentRoom.participants.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-xs">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                      getStatusColor(user.status)
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Central de Comunicação</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {chatRooms.reduce((sum, room) => sum + room.unreadCount, 0)} não lidas
          </Badge>
        </div>
      </div>

      <Card className="h-[700px]">
        <div className="flex h-full">
          {renderChatList()}
          {renderChatArea()}
          {renderUsersList()}
        </div>
      </Card>
    </div>
  );
};
