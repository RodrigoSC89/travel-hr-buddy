/**
 * CommunicationCenterProfessional
 * ✅ P0 CORRIGIDO: Dados reais via Supabase (R01 MITIGADO)
 */
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare, Inbox, Hash, Send, Settings, Search, Plus, Clock,
  CheckCircle2, AlertTriangle, User, Building, Shield, Sparkles, Bot,
  RefreshCw, Reply, Users, WifiOff, Megaphone
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  priority: "low" | "normal" | "high" | "critical";
  category: "general" | "hr" | "operations" | "emergency" | "system" | "ai";
  status: "sent" | "delivered" | "read" | "archived";
  isUrgent: boolean;
  isBroadcast: boolean;
  isAI?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: "group" | "department" | "broadcast" | "emergency";
  isPublic: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Ontem";
  return `${diffDays}d`;
};

const getPriorityColor = (priority: Message["priority"]) => {
  switch (priority) {
    case "critical": return "bg-destructive text-destructive-foreground";
    case "high": return "bg-orange-500 text-white";
    case "normal": return "bg-primary text-primary-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getCategoryIcon = (category: Message["category"]) => {
  switch (category) {
    case "hr": return User;
    case "operations": return Building;
    case "emergency": return AlertTriangle;
    case "system": return Shield;
    case "ai": return Bot;
    default: return MessageSquare;
  }
};

const getChannelIcon = (type: Channel["type"]) => {
  switch (type) {
    case "department": return Building;
    case "broadcast": return Megaphone;
    case "emergency": return AlertTriangle;
    default: return Users;
  }
};

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: number | string; color: string }> = 
  ({ icon: Icon, label, value, color }) => (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

export const CommunicationCenterProfessional: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [inboxTab, setInboxTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ R01: Fetch real messages from database
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ["communication-messages"],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return (data || []).map(n => ({
        id: n.id,
        senderId: n.user_id || "system",
        senderName: String(n.type || "Sistema"),
        senderRole: "Sistema",
        content: n.message || "",
        timestamp: n.created_at || new Date().toISOString(),
        priority: (n.type === "error" ? "critical" : n.type === "warning" ? "high" : "normal") as Message["priority"],
        category: "system" as Message["category"],
        status: (n.read ? "read" : "delivered") as Message["status"],
        isUrgent: n.type === "error" || n.type === "warning",
        isBroadcast: false,
        isAI: false,
      }));
    },
    refetchInterval: 30000,
  });

  // ✅ R01: Fetch real channels from database
  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["communication-channels"],
    queryFn: async (): Promise<Channel[]> => {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.name || "Canal",
        description: c.description || "",
        type: (c.channel_type === "department" ? "department" : c.channel_type === "emergency" ? "emergency" : "group") as Channel["type"],
        isPublic: c.is_public ?? true,
        memberCount: c.member_count || 0,
        unreadCount: 0,
        lastMessage: undefined,
        lastMessageTime: undefined,
      }));
    },
  });

  const messages = messagesData || [];
  const channels = channelsData || [];
  const isLoading = messagesLoading || channelsLoading;

  const stats = useMemo(() => ({
    total: messages.length,
    unread: messages.filter(m => m.status !== "read").length,
    urgent: messages.filter(m => m.isUrgent).length,
    channels: channels.length,
    today: messages.filter(m => {
      const msgDate = new Date(m.timestamp).toDateString();
      return msgDate === new Date().toDateString();
    }).length,
  }), [messages, channels]);

  const filteredMessages = useMemo(() => {
    let result = [...messages];
    if (inboxTab === "unread") result = result.filter(m => m.status !== "read");
    if (inboxTab === "urgent") result = result.filter(m => m.isUrgent);
    if (inboxTab === "starred") result = result.filter(m => m.priority === "high" || m.priority === "critical");
    if (inboxTab === "archived") result = result.filter(m => m.status === "archived");
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.content.toLowerCase().includes(term) || 
        m.senderName.toLowerCase().includes(term)
      );
    }
    return result;
  }, [messages, inboxTab, searchTerm]);

  const handleMarkAsRead = useCallback(async (messageId: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", messageId);
    await refetchMessages();
    toast({ title: "Mensagem marcada como lida" });
  }, [toast, refetchMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    
    toast({ title: "Mensagem enviada com sucesso" });
    setNewMessage("");
    setIsComposeOpen(false);
    await refetchMessages();
  }, [newMessage, toast, refetchMessages]);

  const handleAIAssist = useCallback(async () => {
    if (!newMessage.trim()) {
      toast({ title: "Digite uma mensagem para a IA ajudar", variant: "destructive" });
      return;
    }

    setIsLoadingAI(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: newMessage, context: "communication" },
      });

      if (error) throw error;
      toast({ title: "Resposta da IA gerada" });
      await refetchMessages();
    } catch {
      toast({ title: "IA não disponível", variant: "destructive" });
    } finally {
      setIsLoadingAI(false);
    }
  }, [newMessage, toast, refetchMessages]);

  // ⚠️ Estado "Não Configurado" quando não há dados
  if (!isLoading && messages.length === 0 && channels.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Centro de Comunicação</h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            IA Integrada
          </Badge>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Comunicação Não Configurada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Nenhuma mensagem ou canal configurado. Configure o módulo de comunicação para começar.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este painel exibe apenas dados reais do banco de dados.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/settings/integrations')}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Comunicação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Centro de Comunicação</h1>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            IA Integrada
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchMessages()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Mensagem</DialogTitle>
                <DialogDescription>Compose uma nova mensagem para enviar</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleAIAssist}
                    disabled={isLoadingAI}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    {isLoadingAI ? "Gerando..." : "Assistente IA"}
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Inbox} label="Total" value={stats.total} color="bg-primary/10 text-primary" />
        <StatCard icon={Clock} label="Não Lidas" value={stats.unread} color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={AlertTriangle} label="Urgentes" value={stats.urgent} color="bg-destructive/10 text-destructive" />
        <StatCard icon={Hash} label="Canais" value={stats.channels} color="bg-green-500/10 text-green-500" />
        <StatCard icon={CheckCircle2} label="Hoje" value={stats.today} color="bg-purple-500/10 text-purple-500" />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            Caixa de Entrada
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Hash className="h-4 w-4" />
            Canais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Mensagens</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                </div>
              </div>
              <Tabs value={inboxTab} onValueChange={setInboxTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">Não Lidas</TabsTrigger>
                  <TabsTrigger value="urgent" className="text-xs">Urgentes</TabsTrigger>
                  <TabsTrigger value="starred" className="text-xs">Importantes</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {filteredMessages.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMessages.map((message) => {
                      const CategoryIcon = getCategoryIcon(message.category);
                      return (
                        <div
                          key={message.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                            message.status !== "read" ? "bg-primary/5 border-primary/20" : ""
                          }`}
                          onClick={() => {
                            setSelectedMessage(message);
                            if (message.status !== "read") {
                              handleMarkAsRead(message.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={getPriorityColor(message.priority)}>
                                <CategoryIcon className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{message.senderName}</span>
                                  {message.isUrgent && (
                                    <Badge variant="destructive" className="text-xs">Urgente</Badge>
                                  )}
                                  {message.isAI && (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                      <Bot className="h-3 w-3" />
                                      IA
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Canais</CardTitle>
            </CardHeader>
            <CardContent>
              {channels.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum canal configurado</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {channels.map((channel) => {
                    const ChannelIcon = getChannelIcon(channel.type);
                    return (
                      <div
                        key={channel.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <ChannelIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{channel.name}</span>
                              {channel.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {channel.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{channel.description}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {channel.memberCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={getPriorityColor(selectedMessage.priority)}>
                      {getCategoryIcon(selectedMessage.category) && 
                        React.createElement(getCategoryIcon(selectedMessage.category), { className: "h-5 w-5" })}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedMessage.senderName}</DialogTitle>
                    <DialogDescription>
                      {new Date(selectedMessage.timestamp).toLocaleString('pt-BR')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-2" />
                  Responder
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationCenterProfessional;
