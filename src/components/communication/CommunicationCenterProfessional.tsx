import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Inbox,
  Hash,
  Send,
  Bell,
  Settings,
  Search,
  Filter,
  Plus,
  Star,
  Archive,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Megaphone,
  Shield,
  Sparkles,
  Bot,
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  Mic,
  RefreshCw,
  Eye,
  Reply,
  Forward,
  ChevronRight,
  Users,
  Volume2,
  Lock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
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

// Mock Data
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    senderId: "system",
    senderName: "Sistema Nautilus",
    senderRole: "Sistema",
    content: "Bem-vindo ao novo centro de comunicação! Todas as mensagens estão organizadas e prontas para uso.",
    timestamp: new Date().toISOString(),
    priority: "normal",
    category: "system",
    status: "delivered",
    isUrgent: false,
    isBroadcast: true,
  },
  {
    id: "2",
    senderId: "hr-001",
    senderName: "Ana Silva",
    senderRole: "Gerente de RH",
    content: "Lembre-se de atualizar seu dossiê até o final desta semana. Os certificados STCW estão próximos do vencimento.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    category: "hr",
    status: "delivered",
    isUrgent: true,
    isBroadcast: false,
  },
  {
    id: "3",
    senderId: "ops-001",
    senderName: "Carlos Mendes",
    senderRole: "Coordenador de Operações",
    content: "Novo embarque programado para 15/02. Favor confirmar disponibilidade até amanhã.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    priority: "high",
    category: "operations",
    status: "delivered",
    isUrgent: true,
    isBroadcast: false,
  },
  {
    id: "4",
    senderId: "ai-assistant",
    senderName: "Assistente IA",
    senderRole: "Inteligência Artificial",
    content: "Detectei 3 certificações expirando nos próximos 30 dias. Deseja que eu ajude a programar as renovações?",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    priority: "normal",
    category: "ai",
    status: "delivered",
    isUrgent: false,
    isBroadcast: false,
    isAI: true,
  },
  {
    id: "5",
    senderId: "emergency",
    senderName: "Central de Emergência",
    senderRole: "Sistema de Emergência",
    content: "ALERTA: Condições meteorológicas adversas previstas para amanhã. Todas as embarcações devem revisar procedimentos.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    priority: "critical",
    category: "emergency",
    status: "read",
    isUrgent: true,
    isBroadcast: true,
  },
];

const MOCK_CHANNELS: Channel[] = [
  { id: "1", name: "Geral", description: "Canal geral de comunicação", type: "broadcast", isPublic: true, memberCount: 156, unreadCount: 5, lastMessage: "Bom dia a todos!", lastMessageTime: "10:45" },
  { id: "2", name: "RH - Recursos Humanos", description: "Comunicações oficiais do RH", type: "department", isPublic: true, memberCount: 89, unreadCount: 2, lastMessage: "Nova política de férias", lastMessageTime: "09:30" },
  { id: "3", name: "Operações Marítimas", description: "Coordenação de operações", type: "department", isPublic: false, memberCount: 34, unreadCount: 0, lastMessage: "Embarque confirmado", lastMessageTime: "08:15" },
  { id: "4", name: "Emergência", description: "Canal de emergência", type: "emergency", isPublic: true, memberCount: 78, unreadCount: 1, lastMessage: "Simulado amanhã", lastMessageTime: "Ontem" },
  { id: "5", name: "DPO Team", description: "Grupo DPO Officers", type: "group", isPublic: false, memberCount: 12, unreadCount: 0, lastMessage: "Reunião às 14h", lastMessageTime: "Ontem" },
  { id: "6", name: "Engenharia", description: "Canal de engenharia", type: "department", isPublic: false, memberCount: 28, unreadCount: 3, lastMessage: "Manutenção programada", lastMessageTime: "2d" },
];

// Utility functions
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

// Components
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
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [channels] = useState<Channel[]>(MOCK_CHANNELS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [inboxTab, setInboxTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const { toast } = useToast();

  // Stats
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

  // Filtered messages
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // Filter by inbox tab
    if (inboxTab === "unread") result = result.filter(m => m.status !== "read");
    if (inboxTab === "urgent") result = result.filter(m => m.isUrgent);
    if (inboxTab === "starred") result = result.filter(m => m.priority === "high" || m.priority === "critical");
    if (inboxTab === "archived") result = result.filter(m => m.status === "archived");

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.content.toLowerCase().includes(term) || 
        m.senderName.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(m => m.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      result = result.filter(m => m.priority === selectedPriority);
    }

    return result;
  }, [messages, inboxTab, searchTerm, selectedCategory, selectedPriority]);

  const handleMarkAsRead = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: "read" as const } : m
    ));
    toast({ title: "Mensagem marcada como lida" });
  }, [toast]);

  const handleArchive = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: "archived" as const } : m
    ));
    toast({ title: "Mensagem arquivada" });
  }, [toast]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: String(Date.now()),
      senderId: "current-user",
      senderName: "Você",
      senderRole: "Usuário",
      content: newMessage,
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "general",
      status: "sent",
      isUrgent: false,
      isBroadcast: false,
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage("");
    setIsComposeOpen(false);
    toast({ title: "Mensagem enviada com sucesso" });
  }, [newMessage, toast]);

  const handleAIAssist = useCallback(async () => {
    if (!newMessage.trim()) {
      toast({ title: "Digite uma mensagem para a IA ajudar", variant: "destructive" });
      return;
    }

    setIsLoadingAI(true);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse: Message = {
      id: String(Date.now()),
      senderId: "ai-assistant",
      senderName: "Assistente IA",
      senderRole: "Inteligência Artificial",
      content: `Com base na sua mensagem, sugiro:\n\n• Verifique os protocolos de comunicação padrão\n• Consulte a documentação relacionada\n• Considere agendar uma reunião se necessário\n\nPosso ajudar com mais alguma coisa?`,
      timestamp: new Date().toISOString(),
      priority: "normal",
      category: "ai",
      status: "delivered",
      isUrgent: false,
      isBroadcast: false,
      isAI: true,
    };

    setMessages(prev => [aiResponse, ...prev]);
    setIsLoadingAI(false);
    toast({ title: "Resposta da IA gerada" });
  }, [newMessage, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold">Centro de Comunicação</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              IA Integrada
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Comunicação interna profissional e inteligente
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Mensagem</DialogTitle>
                <DialogDescription>
                  Compose uma nova mensagem para a equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Destinatário</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      <SelectItem value="hr">RH</SelectItem>
                      <SelectItem value="ops">Operações</SelectItem>
                      <SelectItem value="eng">Engenharia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 border-primary/50"
                            onClick={handleAIAssist}
                            disabled={isLoadingAI}
                          >
                            <Sparkles className={`h-4 w-4 text-primary ${isLoadingAI ? "animate-spin" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Assistência IA</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSendMessage} className="gap-2">
                      <Send className="h-4 w-4" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={MessageSquare} label="Total" value={stats.total} color="bg-primary/10 text-primary" />
        <StatCard icon={Inbox} label="Não Lidas" value={stats.unread} color="bg-orange-500/10 text-orange-500" />
        <StatCard icon={AlertTriangle} label="Urgentes" value={stats.urgent} color="bg-destructive/10 text-destructive" />
        <StatCard icon={Hash} label="Canais" value={stats.channels} color="bg-green-500/10 text-green-500" />
        <StatCard icon={Clock} label="Hoje" value={stats.today} color="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Urgent Alert */}
      {stats.urgent > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">
                  Você tem {stats.urgent} mensagem(ns) urgente(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  Clique para visualizar imediatamente
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => { setActiveTab("inbox"); setInboxTab("urgent"); }}
              >
                Ver Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-muted/50">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Caixa de Entrada</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Canais</span>
          </TabsTrigger>
          <TabsTrigger value="compose" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Compor</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 hidden lg:flex">
            <Bot className="h-4 w-4" />
            <span>Assistente IA</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 hidden lg:flex">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox" className="mt-6 space-y-4">
          {/* Filters */}
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar mensagens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/50"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="hr">RH</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                    <SelectItem value="ai">IA</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={inboxTab} onValueChange={setInboxTab} className="mt-4">
                <TabsList className="bg-transparent p-0 h-auto gap-2">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Todas
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Não Lidas
                    {stats.unread > 0 && <Badge variant="destructive" className="h-5 px-1.5">{stats.unread}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="urgent" className="gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Urgentes
                    {stats.urgent > 0 && <Badge variant="destructive" className="h-5 px-1.5">{stats.urgent}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="starred" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Favoritas
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Arquivadas
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-2">
            {filteredMessages.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
                  <p className="text-muted-foreground">Ajuste os filtros ou aguarde novas mensagens.</p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-4">
                  {filteredMessages.map((message) => {
                    const CategoryIcon = getCategoryIcon(message.category);
                    const isUnread = message.status !== "read" && message.status !== "archived";

                    return (
                      <Card
                        key={message.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-border/50 ${
                          isUnread ? "bg-primary/5 border-primary/30" : ""
                        } ${message.isUrgent ? "border-l-4 border-l-destructive" : ""}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className={`h-10 w-10 ring-2 ${message.isAI ? "ring-primary" : "ring-background"}`}>
                              <AvatarFallback className={message.isAI ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground" : ""}>
                                {message.isAI ? <Bot className="h-5 w-5" /> : message.senderName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{message.senderName}</span>
                                  <Badge variant="outline" className="text-xs">{message.senderRole}</Badge>
                                  <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                    {message.priority.toUpperCase()}
                                  </Badge>
                                  {message.isUrgent && <Badge variant="destructive" className="text-xs">URGENTE</Badge>}
                                  {message.isAI && <Badge className="text-xs bg-gradient-to-r from-primary to-purple-600">IA</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatTimeAgo(message.timestamp)}
                                </span>
                              </div>

                              <p className={`text-sm line-clamp-2 ${isUnread ? "font-medium" : ""}`}>
                                {message.content}
                              </p>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  {isUnread && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                      <Eye className="h-3 w-3" /> Não lida
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(message.id); }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => { e.stopPropagation(); handleArchive(message.id); }}
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover border-border">
                                      <DropdownMenuItem><Reply className="h-4 w-4 mr-2" />Responder</DropdownMenuItem>
                                      <DropdownMenuItem><Forward className="h-4 w-4 mr-2" />Encaminhar</DropdownMenuItem>
                                      <DropdownMenuItem><Star className="h-4 w-4 mr-2" />Favoritar</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => {
              const ChannelIcon = getChannelIcon(channel.type);
              return (
                <Card key={channel.id} className="cursor-pointer hover:shadow-md transition-all border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg ${
                        channel.type === "emergency" ? "bg-destructive/10 text-destructive" :
                        channel.type === "department" ? "bg-blue-500/10 text-blue-500" :
                        channel.type === "broadcast" ? "bg-orange-500/10 text-orange-500" :
                        "bg-green-500/10 text-green-500"
                      }`}>
                        <ChannelIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{channel.name}</h3>
                          {!channel.isPublic && <Lock className="h-3 w-3 text-muted-foreground" />}
                          {channel.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5">{channel.unreadCount}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{channel.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{channel.memberCount}</span>
                          {channel.lastMessage && (
                            <span className="truncate flex-1">{channel.lastMessage}</span>
                          )}
                          {channel.lastMessageTime && <span>{channel.lastMessageTime}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Compor Nova Mensagem
              </CardTitle>
              <CardDescription>
                Envie mensagens para canais ou usuários específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Destinatário</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Canais</SelectItem>
                      <SelectItem value="hr">RH - Recursos Humanos</SelectItem>
                      <SelectItem value="ops">Operações Marítimas</SelectItem>
                      <SelectItem value="eng">Engenharia</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Smile className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Mic className="h-4 w-4" /></Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-primary/50"
                          onClick={handleAIAssist}
                          disabled={isLoadingAI}
                        >
                          <Sparkles className={`h-4 w-4 text-primary ${isLoadingAI ? "animate-pulse" : ""}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Melhorar com IA</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button onClick={handleSendMessage} className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Central de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Nova mensagem urgente", desc: "Carlos Mendes enviou uma mensagem urgente", time: "5 min", type: "urgent" },
                  { title: "Certificado expirando", desc: "Seu STCW expira em 30 dias", time: "1h", type: "warning" },
                  { title: "Novo membro no canal", desc: "João Silva entrou em Operações Marítimas", time: "2h", type: "info" },
                  { title: "Embarque confirmado", desc: "Seu próximo embarque foi confirmado", time: "3h", type: "success" },
                ].map((notification, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer">
                    <div className={`p-2 rounded-full ${
                      notification.type === "urgent" ? "bg-destructive/10 text-destructive" :
                      notification.type === "warning" ? "bg-orange-500/10 text-orange-500" :
                      notification.type === "success" ? "bg-green-500/10 text-green-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Assistente IA
                <Badge className="bg-gradient-to-r from-primary to-purple-600">Beta</Badge>
              </CardTitle>
              <CardDescription>
                Use inteligência artificial para otimizar suas comunicações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Resumir Mensagens", desc: "Crie resumos automáticos das mensagens não lidas", icon: MessageSquare },
                  { title: "Sugerir Respostas", desc: "Receba sugestões de respostas baseadas no contexto", icon: Reply },
                  { title: "Análise de Prioridade", desc: "Classifique automaticamente mensagens por urgência", icon: AlertTriangle },
                ].map((feature, i) => (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-all border-primary/20 hover:border-primary/50">
                    <CardContent className="p-4">
                      <feature.icon className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "Notificações por Email", desc: "Receba notificações por email para mensagens importantes" },
                { title: "Som de Notificação", desc: "Ative sons para novas mensagens" },
                { title: "Modo Não Perturbe", desc: "Desative todas as notificações temporariamente" },
                { title: "Resumo Diário", desc: "Receba um resumo diário das mensagens não lidas" },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenterProfessional;
