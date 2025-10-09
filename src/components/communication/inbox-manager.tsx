import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Archive, 
  Trash2, 
  Star, 
  AlertTriangle,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Reply,
  Forward,
  Download,
  Bell,
  Shield,
  Building
} from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  recipient_id?: string;
  content: string;
  message_type: "text" | "file" | "voice" | "image" | "system" | "ai_response";
  priority: "low" | "normal" | "high" | "critical";
  category: "general" | "hr" | "operations" | "emergency" | "system" | "ai_notification";
  status: "sent" | "delivered" | "read" | "archived";
  is_urgent: boolean;
  is_broadcast: boolean;
  created_at: string;
  read_at?: string;
  attachments?: any[];
  metadata?: any;
}

interface InboxManagerProps {
  unreadCount: number;
  urgentCount: number;
  onStatsUpdate: (stats: any) => void;
}

export const InboxManager: React.FC<InboxManagerProps> = ({
  unreadCount,
  urgentCount,
  onStatsUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeInboxTab, setActiveInboxTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    setupRealTimeSubscription();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, selectedCategory, selectedPriority, activeInboxTab]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Mock messages data - replace with real Supabase query
      const mockMessages: Message[] = [
        {
          id: "1",
          sender_id: "system",
          sender_name: "Sistema Nautilus",
          sender_role: "Sistema",
          content: "Bem-vindo ao novo centro de comunicação! Agora você pode gerenciar todas as suas mensagens de forma organizada.",
          message_type: "system",
          priority: "normal",
          category: "system",
          status: "delivered",
          is_urgent: false,
          is_broadcast: true,
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          sender_id: "hr-001",
          sender_name: "Ana Silva",
          sender_role: "Gerente de RH",
          content: "Lembre-se de atualizar seu dossiê até o final desta semana. Os certificados STCW estão próximos do vencimento.",
          message_type: "text",
          priority: "high",
          category: "hr",
          status: "delivered",
          is_urgent: true,
          is_broadcast: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          sender_id: "ops-001",
          sender_name: "Carlos Mendes",
          sender_role: "Coordenador de Operações",
          content: "Novo embarque programado para 15/02. Favor confirmar disponibilidade até amanhã.",
          message_type: "text",
          priority: "high",
          category: "operations",
          status: "delivered",
          is_urgent: true,
          is_broadcast: false,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "4",
          sender_id: "ai-assistant",
          sender_name: "Assistente IA",
          sender_role: "Inteligência Artificial",
          content: "Detectei que você possui 3 certificações expirando nos próximos 30 dias. Deseja que eu ajude a programar as renovações?",
          message_type: "ai_response",
          priority: "normal",
          category: "ai_notification",
          status: "delivered",
          is_urgent: false,
          is_broadcast: false,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "5",
          sender_id: "emergency-001",
          sender_name: "Central de Emergência",
          sender_role: "Sistema de Emergência",
          content: "EMERGÊNCIA: Tempestade severa detectada na rota Santos-Rio. Todas as embarcações devem alterar curso imediatamente.",
          message_type: "system",
          priority: "critical",
          category: "emergency",
          status: "delivered",
          is_urgent: true,
          is_broadcast: true,
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages"
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Filter by tab
    switch (activeInboxTab) {
    case "unread":
      filtered = filtered.filter(m => m.status !== "read");
      break;
    case "urgent":
      filtered = filtered.filter(m => m.is_urgent);
      break;
    case "starred":
      // Mock starred filter
      filtered = filtered.filter(m => m.priority === "high" || m.priority === "critical");
      break;
    case "archived":
      filtered = filtered.filter(m => m.status === "archived");
      break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(m => m.priority === selectedPriority);
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    try {
      // Update message status
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, status: "read" as const, read_at: new Date().toISOString() }
            : m
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Mensagem marcada como lida"
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const archiveMessage = async (messageId: string) => {
    try {
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, status: "archived" as const }
            : m
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Mensagem arquivada"
      });
    } catch (error) {
      console.error("Error archiving message:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "bg-destructive text-destructive-foreground";
    case "high": return "bg-warning text-warning-foreground";
    case "normal": return "bg-primary text-primary-foreground";
    case "low": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
    case "hr": return User;
    case "operations": return Building;
    case "emergency": return AlertTriangle;
    case "system": return Shield;
    case "ai_notification": return MessageSquare;
    default: return MessageSquare;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Caixa de Entrada
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{filteredMessages.length} mensagens</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="hr">RH</SelectItem>
                <SelectItem value="operations">Operações</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="ai_notification">IA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-40">
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

          <Tabs value={activeInboxTab} onValueChange={setActiveInboxTab}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="unread" className="gap-2">
                Não Lidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="urgent" className="gap-2">
                Urgentes
                {urgentCount > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {urgentCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="starred">Favoritas</TabsTrigger>
              <TabsTrigger value="archived">Arquivadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhuma mensagem encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou verifique novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => {
            const CategoryIcon = getCategoryIcon(message.category);
            const isUnread = message.status !== "read";
            
            return (
              <Card 
                key={message.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isUnread ? "border-primary/50 bg-primary/5" : ""
                } ${message.is_urgent ? "border-l-4 border-l-destructive" : ""}`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      message.category === "emergency" ? "bg-destructive/10" :
                        message.category === "hr" ? "bg-info/10" :
                          message.category === "operations" ? "bg-warning/10" :
                            message.category === "ai_notification" ? "bg-success/10" :
                              "bg-muted"
                    }`}>
                      <CategoryIcon className={`h-4 w-4 ${
                        message.category === "emergency" ? "text-destructive" :
                          message.category === "hr" ? "text-info" :
                            message.category === "operations" ? "text-warning" :
                              message.category === "ai_notification" ? "text-success" :
                                "text-muted-foreground"
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{message.sender_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {message.sender_role}
                          </Badge>
                          <Badge 
                            className={`text-xs ${getPriorityColor(message.priority)}`}
                          >
                            {message.priority.toUpperCase()}
                          </Badge>
                          {message.is_urgent && (
                            <Badge variant="destructive" className="text-xs">
                              URGENTE
                            </Badge>
                          )}
                          {message.is_broadcast && (
                            <Badge variant="secondary" className="text-xs">
                              TRANSMISSÃO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(message.created_at)}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${isUnread ? "font-medium" : ""} line-clamp-2`}>
                        {message.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <Badge variant="outline" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Não lida
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(message.id);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveMessage(message.id);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};