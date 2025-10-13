import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Share2,
  Activity,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  Calendar,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";

interface UserPresence {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: "online" | "busy" | "away" | "offline";
  last_seen: string;
  current_page?: string;
  vessel_id?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  timestamp: string;
  type: "text" | "system" | "file" | "location";
  metadata?: any;
}

interface WorkspaceUpdate {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  description: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  vessel_id?: string;
  related_data?: any;
}

const RealTimeWorkspace: React.FC = () => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [workspaceUpdates, setWorkspaceUpdates] = useState<WorkspaceUpdate[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [myStatus, setMyStatus] = useState<"online" | "busy" | "away">("online");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Configurar presença e chat em tempo real
  useEffect(() => {
    if (!user) return;

    const setupRealtime = async () => {
      try {
        setIsLoading(true);

        // Canal principal do workspace
        const channel = supabase.channel("maritime_workspace", {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channelRef.current = channel;

        // Configurar presença
        channel
          .on("presence", { event: "sync" }, () => {
            const presenceState = channel.presenceState();
            const users: UserPresence[] = [];
            
            Object.keys(presenceState).forEach(userId => {
              const presences = presenceState[userId];
              if (presences && presences.length > 0) {
                const presence = presences[0] as any;
                users.push({
                  user_id: userId,
                  name: presence.name || "Usuário",
                  email: presence.email || "",
                  avatar_url: presence.avatar_url,
                  status: presence.status || "online",
                  last_seen: presence.last_seen || new Date().toISOString(),
                  current_page: presence.current_page,
                  vessel_id: presence.vessel_id
                });
              }
            });
            
            setOnlineUsers(users);
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            const newUser = newPresences[0];
            toast({
              title: `${newUser.name} entrou no workspace`,
              description: "Usuário conectado",
            });
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            const leftUser = leftPresences[0];
            toast({
              title: `${leftUser.name} saiu do workspace`,
              description: "Usuário desconectado",
            });
          });

        // Configurar mensagens de chat
        channel.on("broadcast", { event: "chat_message" }, (payload) => {
          const message: ChatMessage = {
            id: Date.now().toString(),
            user_id: payload.payload.user_id,
            user_name: payload.payload.user_name,
            message: payload.payload.message,
            timestamp: payload.payload.timestamp,
            type: payload.payload.type || "text",
            metadata: payload.payload.metadata
          };
          
          setChatMessages(prev => [...prev, message]);
        });

        // Configurar atualizações do workspace
        channel.on("broadcast", { event: "workspace_update" }, (payload) => {
          const update: WorkspaceUpdate = {
            id: Date.now().toString(),
            user_id: payload.user_id,
            user_name: payload.user_name,
            action: payload.action,
            description: payload.description,
            timestamp: payload.timestamp,
            priority: payload.priority || "low",
            vessel_id: payload.vessel_id,
            related_data: payload.related_data
          };
          
          setWorkspaceUpdates(prev => [update, ...prev.slice(0, 49)]);
        });

        // Fazer subscribe
        await channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            // Trackear presença
            await channel.track({
              user_id: user.id,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
              email: user.email,
              avatar_url: user.user_metadata?.avatar_url,
              status: myStatus,
              last_seen: new Date().toISOString(),
              current_page: window.location.pathname,
              vessel_id: null
            });

            // Carregar mensagens iniciais (simulado)
            loadInitialData();
          }
        });

      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao conectar ao workspace em tempo real",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupRealtime();

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user, myStatus, toast]);

  // Carregar dados iniciais
  const loadInitialData = () => {
    // Simular mensagens iniciais
    const initialMessages: ChatMessage[] = [
      {
        id: "1",
        user_id: "system",
        user_name: "Sistema",
        message: "Bem-vindo ao workspace marítimo em tempo real!",
        timestamp: new Date().toISOString(),
        type: "system"
      }
    ];

    // Simular atualizações do workspace
    const initialUpdates: WorkspaceUpdate[] = [
      {
        id: "1",
        user_id: "system",
        user_name: "Sistema",
        action: "workspace_started",
        description: "Workspace iniciado com sucesso",
        timestamp: new Date().toISOString(),
        priority: "low"
      }
    ];

    setChatMessages(initialMessages);
    setWorkspaceUpdates(initialUpdates);
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !channelRef.current) return;

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "chat_message",
        payload: {
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
          message: newMessage,
          timestamp: new Date().toISOString(),
          type: "text",
          room: selectedRoom
        }
      });

      setNewMessage("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive"
      });
    }
  };

  // Enviar atualização do workspace
  const sendWorkspaceUpdate = async (action: string, description: string, priority: "low" | "medium" | "high" = "medium") => {
    if (!user || !channelRef.current) return;

    try {
      await channelRef.current.send({
        type: "broadcast",
        event: "workspace_update",
        payload: {
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
          action,
          description,
          timestamp: new Date().toISOString(),
          priority
        }
      });
    } catch (error) {
      logger.error("Failed to send reaction:", error);
    }
  };

  // Alterar status
  const changeStatus = async (newStatus: "online" | "busy" | "away") => {
    if (!channelRef.current) return;

    setMyStatus(newStatus);
    
    try {
      await channelRef.current.track({
        user_id: user?.id,
        name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário",
        email: user?.email,
        avatar_url: user?.user_metadata?.avatar_url,
        status: newStatus,
        last_seen: new Date().toISOString(),
        current_page: window.location.pathname
      });
    } catch (error) {
      logger.error("Failed to change status:", error);
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
    case "online": return "bg-green-500";
    case "busy": return "bg-red-500";
    case "away": return "bg-yellow-500";
    default: return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online": return <Circle className="h-3 w-3 fill-current" />;
    case "busy": return <AlertTriangle className="h-3 w-3" />;
    case "away": return <Clock className="h-3 w-3" />;
    default: return <Circle className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "high": return "text-red-600 bg-red-50 border-red-200";
    case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
    default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Users Online Panel */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Equipe Online ({onlineUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="text-sm font-medium">Seu Status:</div>
              <div className="flex gap-1">
                <Button
                  variant={myStatus === "online" ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeStatus("online")}
                  className="text-xs"
                >
                  <Circle className="h-3 w-3 mr-1 fill-current text-green-500" />
                  Online
                </Button>
                <Button
                  variant={myStatus === "busy" ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeStatus("busy")}
                  className="text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                  Ocupado
                </Button>
                <Button
                  variant={myStatus === "away" ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeStatus("away")}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                  Ausente
                </Button>
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{user.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              className="w-full justify-start"
              onClick={() => sendWorkspaceUpdate("emergency_drill", "Simulado de emergência iniciado", "high")}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulado de Emergência
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full justify-start"
              onClick={() => sendWorkspaceUpdate("shift_change", "Troca de turno em andamento", "medium")}
            >
              <Clock className="h-4 w-4 mr-2" />
              Troca de Turno
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full justify-start"
              onClick={() => sendWorkspaceUpdate("maintenance_alert", "Manutenção programada", "low")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Alerta de Manutenção
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Collaboration Area */}
      <div className="lg:col-span-3">
        <Tabs defaultValue="chat" className="h-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat em Tempo Real
              </TabsTrigger>
              <TabsTrigger value="updates" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Atualizações do Workspace
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="h-[calc(100vh-200px)]">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Canal: #{selectedRoom}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Chamada
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Vídeo
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.type === "system" ? "justify-center" : ""}`}>
                        {message.type !== "system" && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs">
                              {message.user_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 ${message.type === "system" ? "text-center" : ""}`}>
                          {message.type === "system" ? (
                            <Badge variant="secondary" className="text-xs">
                              {message.message}
                            </Badge>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.user_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString("pt-BR")}
                                </span>
                              </div>
                              <div className="text-sm bg-accent/20 rounded-lg p-2">
                                {message.message}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="h-[calc(100vh-200px)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atualizações em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {workspaceUpdates.map((update) => (
                      <div key={update.id} className={`p-3 rounded-lg border ${getPriorityColor(update.priority)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{update.user_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {update.action}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{update.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(update.timestamp).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            update.priority === "high" ? "bg-red-500" :
                              update.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealTimeWorkspace;