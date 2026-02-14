/**
 * PATCH 1007 - Collaborative Chat
 * Real-time chat with presence indicators and team collaboration
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageCircle,
  Send,
  Users,
  Circle,
  Paperclip,
  Smile,
  MoreHorizontal,
  Reply,
  Pin,
  Hash,
  AtSign,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  channel: string;
  isPinned?: boolean;
  replyTo?: string;
  attachments?: string[];
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy";
  lastSeen: Date;
}

const CHANNELS = [
  { id: "general", name: "Geral", icon: <Hash className="h-4 w-4" /> },
  { id: "operations", name: "Operações", icon: <Hash className="h-4 w-4" /> },
  { id: "maintenance", name: "Manutenção", icon: <Hash className="h-4 w-4" /> },
  { id: "alerts", name: "Alertas", icon: <Hash className="h-4 w-4" /> },
];

export function CollaborativeChat() {
  const [currentChannel, setCurrentChannel] = useState("general");
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock current user (would come from auth in production)
  const currentUser = {
    id: "current-user",
    name: "Você",
    avatar: undefined,
  };

  // Mock messages for demo
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Bom dia equipe! Alguma atualização sobre a manutenção do Navio Atlântico?",
      userId: "user-1",
      userName: "Carlos Silva",
      timestamp: new Date(Date.now() - 3600000),
      channel: "general",
    },
    {
      id: "2",
      content: "Sim, a manutenção foi concluída ontem. Todos os sistemas operacionais.",
      userId: "user-2",
      userName: "Maria Santos",
      timestamp: new Date(Date.now() - 3000000),
      channel: "general",
    },
    {
      id: "3",
      content: "Ótimo! Podemos liberar para operação então.",
      userId: "user-1",
      userName: "Carlos Silva",
      timestamp: new Date(Date.now() - 2400000),
      channel: "general",
    },
  ]);

  // Setup realtime presence
  useEffect(() => {
    const channel = supabase.channel("chat-presence");

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.values(state).forEach((presences) => {
          const typedPresences = presences as unknown as Array<{ user_id?: string; user_name?: string; status?: string }>;
          typedPresences.forEach((presence) => {
            if (presence.user_id && presence.user_name) {
              users.push({
                id: presence.user_id,
                name: presence.user_name,
                status: (presence.status as OnlineUser["status"]) || "online",
                lastSeen: new Date(),
              });
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        logger.debug("User joined:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        logger.debug("User left:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUser.id,
            user_name: currentUser.name,
            status: "online",
            online_at: new Date().toISOString(),
          });
        }
      });

    // Simulate online users for demo
    setOnlineUsers([
      { id: "user-1", name: "Carlos Silva", status: "online", lastSeen: new Date() },
      { id: "user-2", name: "Maria Santos", status: "online", lastSeen: new Date() },
      { id: "user-3", name: "João Pereira", status: "away", lastSeen: new Date(Date.now() - 300000) },
    ]);

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Setup realtime messages
  useEffect(() => {
    const channel = supabase.channel("chat-messages");

    channel
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as ChatMessage]);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, userName } = payload as { userId: string; userName: string };
        if (userId !== currentUser.id) {
          setIsTyping((prev) => [...new Set([...prev, userName])]);
          setTimeout(() => {
            setIsTyping((prev) => prev.filter((n) => n !== userName));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date(),
      channel: currentChannel,
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    // Broadcast to channel
    await supabase.channel("chat-messages").send({
      type: "broadcast",
      event: "new-message",
      payload: newMessage,
    });

    toast.success("Mensagem enviada");
  }, [message, currentChannel, currentUser]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    supabase.channel("chat-messages").send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUser.id, userName: currentUser.name },
    });

    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  }, [currentUser]);

  const channelMessages = messages.filter((m) => m.channel === currentChannel);

  const formatMessageTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return `Ontem ${format(date, "HH:mm")}`;
    }
    return format(date, "dd/MM HH:mm");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Chat Colaborativo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
              {onlineUsers.filter((u) => u.status === "online").length} online
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Ver participantes" title="Participantes">
                  <Users className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Usuários Online</h4>
                  <Separator />
                  {onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 py-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{user.name}</span>
                      <Circle
                        className={cn(
                          "h-2 w-2",
                          user.status === "online" && "fill-green-500 text-green-500",
                          user.status === "away" && "fill-yellow-500 text-yellow-500",
                          user.status === "busy" && "fill-red-500 text-red-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-1 min-h-0">
        {/* Channels Sidebar */}
        <div className="w-40 border-r bg-muted/30">
          <div className="p-2 space-y-1">
            {CHANNELS.map((channel) => (
              <Button
                key={channel.id}
                variant={currentChannel === channel.id ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setCurrentChannel(channel.id)}
              >
                {channel.icon}
                <span className="ml-2">{channel.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {channelMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.userId === currentUser.id && "flex-row-reverse"
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {msg.userAvatar ? (
                      <AvatarImage src={msg.userAvatar} />
                    ) : null}
                    <AvatarFallback>
                      {msg.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      msg.userId === currentUser.id && "items-end"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{msg.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        msg.userId === currentUser.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </span>
                  {isTyping.join(", ")} está digitando...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Anexar arquivo" title="Anexar">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder={`Mensagem em #${CHANNELS.find((c) => c.id === currentChannel)?.name || currentChannel}`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" className="flex-shrink-0" aria-label="Emojis" title="Emojis">
                <Smile className="h-4 w-4" />
              </Button>
              <Button onClick={sendMessage} size="icon" disabled={!message.trim()} aria-label="Enviar mensagem" title="Enviar">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CollaborativeChat;
