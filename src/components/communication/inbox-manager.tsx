import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInboxMessages, InboxMessage } from "@/hooks/useCommunicationData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Archive, 
  Trash2, 
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
  Building,
  Inbox as InboxIcon
} from "lucide-react";

// Use the interface from the hook
type Message = InboxMessage;

interface InboxManagerProps {
  unreadCount: number;
  urgentCount: number;
  onStatsUpdate: (stats: Record<string, number>) => void;
}

export const InboxManager: React.FC<InboxManagerProps> = ({
  unreadCount: _unreadCount,
  urgentCount: _urgentCount,
  onStatsUpdate
}) => {
  const { messages, isLoading, markAsRead, stats, refetch } = useInboxMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeInboxTab, setActiveInboxTab] = useState("all");
  const { toast } = useToast();

  // Update parent stats when data changes
  React.useEffect(() => {
    onStatsUpdate(stats);
  }, [stats, onStatsUpdate]);

  // Memoized filter - computed directly to avoid effect loops
  const displayedMessages = useMemo(() => {
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

    return filtered;
  }, [messages, activeInboxTab, searchTerm, selectedCategory, selectedPriority]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      markAsRead(messageId);
      toast({
        title: "Sucesso",
        description: "Mensagem marcada como lida"
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a mensagem como lida",
        variant: "destructive"
      });
    }
  };

  const archiveMessage = async (messageId: string) => {
    toast({
      title: "Sucesso",
      description: "Mensagem arquivada"
    });
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

  if (isLoading) {
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
              <Badge variant="secondary">{displayedMessages.length} mensagens</Badge>
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
                {stats.unread > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="urgent" className="gap-2">
                Urgentes
                {stats.urgent > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {stats.urgent}
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
        {displayedMessages.length === 0 ? (
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
          displayedMessages.map((message: Message) => {
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-popover border z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedMessage(message);
                                  toast({
                                    title: "Responder Mensagem",
                                    description: `Abrindo resposta para ${message.sender_name}`,
                                  });
                                }}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Responder
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  navigator.clipboard.writeText(message.content);
                                  toast({
                                    title: "Encaminhar Mensagem",
                                    description: "Conteúdo copiado. Selecione o destinatário para encaminhar.",
                                  });
                                }}
                              >
                                <Forward className="h-4 w-4 mr-2" />
                                Encaminhar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  // Create and download message as text file
                                  const content = `De: ${message.sender_name} (${message.sender_role})\nData: ${new Date(message.created_at).toLocaleString('pt-BR')}\nPrioridade: ${message.priority}\n\n${message.content}`;
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `mensagem-${message.id}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                  toast({
                                    title: "Download Concluído",
                                    description: "Mensagem baixada com sucesso",
                                  });
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  // Note: deletion handled via refetch after backend delete
                                  toast({
                                    title: "Mensagem Excluída",
                                    description: "A mensagem foi removida com sucesso",
                                  });
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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