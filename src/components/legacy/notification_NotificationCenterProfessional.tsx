import { useCallback, useMemo, useState } from "react";;
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Star,
  StarOff,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  AlertTriangle,
  Zap,
  Ship,
  Anchor,
  Users,
  FileText,
  DollarSign,
  Shield,
  Sparkles,
  Bot,
  TrendingUp,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  BellRing,
  BellOff,
  Inbox,
  ArchiveX,
  XCircle,
  ChevronDown,
  ExternalLink,
  Copy,
} from "lucide-react";

// Types
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "critical" | "warning" | "info" | "success" | "system";
  category: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  source?: string;
  action?: {
    label: string;
    url: string;
  };
  metadata?: Record<string, unknown>;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Alerta de Emergência - Navio Alpha",
    message: "Detectada anomalia no sistema de navegação. Verificação imediata necessária.",
    type: "critical",
    category: "operacoes",
    isRead: false,
    isStarred: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    source: "Sistema de Monitoramento",
    action: { label: "Ver Detalhes", url: "/operations" },
  },
  {
    id: "2",
    title: "Certificado Expirando",
    message: "O certificado STCW do tripulante João Silva expira em 15 dias.",
    type: "warning",
    category: "rh",
    isRead: false,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    source: "Gestão de Tripulação",
    action: { label: "Renovar", url: "/crew" },
  },
  {
    id: "3",
    title: "Manutenção Programada",
    message: "Manutenção preventiva do motor principal agendada para amanhã às 08:00.",
    type: "info",
    category: "manutencao",
    isRead: false,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    source: "Sistema de Manutenção",
    action: { label: "Ver Agenda", url: "/maintenance" },
  },
  {
    id: "4",
    title: "Operação Concluída",
    message: "Descarga de carga no Porto de Santos finalizada com sucesso.",
    type: "success",
    category: "operacoes",
    isRead: true,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    source: "Operações Portuárias",
  },
  {
    id: "5",
    title: "Novo Documento Disponível",
    message: "Relatório de inspeção mensal da frota está disponível para download.",
    type: "info",
    category: "documentos",
    isRead: true,
    isStarred: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    source: "Central de Documentos",
    action: { label: "Download", url: "/documents" },
  },
  {
    id: "6",
    title: "Fatura Pendente",
    message: "Fatura de combustível no valor de R$ 45.000,00 aguarda aprovação.",
    type: "warning",
    category: "financeiro",
    isRead: false,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    source: "Financeiro",
    action: { label: "Aprovar", url: "/financial" },
  },
  {
    id: "7",
    title: "Atualização do Sistema",
    message: "Nova versão do Nautilus One disponível. Atualize para acessar novos recursos.",
    type: "system",
    category: "sistema",
    isRead: true,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    source: "Sistema",
  },
  {
    id: "8",
    title: "Análise de IA Disponível",
    message: "O relatório de análise preditiva de manutenção foi gerado pela IA.",
    type: "info",
    category: "ia",
    isRead: false,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    source: "Nautilus AI",
    action: { label: "Ver Análise", url: "/ai-insights" },
  },
  {
    id: "9",
    title: "Alerta de Compliance",
    message: "Prazo de conformidade MARPOL se aproxima. 10 dias restantes.",
    type: "warning",
    category: "compliance",
    isRead: false,
    isStarred: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    source: "Compliance",
    action: { label: "Ver Requisitos", url: "/compliance" },
  },
  {
    id: "10",
    title: "Viagem Confirmada",
    message: "Viagem Santos → Rotterdam confirmada. Partida em 48 horas.",
    type: "success",
    category: "operacoes",
    isRead: true,
    isStarred: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    source: "Planejamento de Viagens",
  },
];

// Utility functions
const formatTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  if (diff < 60000) return "Agora";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
};

const getTypeIcon = (type: string) => {
  switch (type) {
  case "critical": return <AlertCircle className="h-5 w-5 text-destructive" />;
  case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
  case "system": return <Settings className="h-5 w-5 text-purple-500" />;
  default: return <Info className="h-5 w-5 text-primary" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
  case "critical": return <Badge variant="destructive" className="text-xs">Crítica</Badge>;
  case "warning": return <Badge className="text-xs bg-yellow-500/20 text-yellow-600">Atenção</Badge>;
  case "success": return <Badge className="text-xs bg-green-500/20 text-green-600">Sucesso</Badge>;
  case "system": return <Badge className="text-xs bg-purple-500/20 text-purple-500">Sistema</Badge>;
  default: return <Badge variant="secondary" className="text-xs">Info</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
  case "operacoes": return <Ship className="h-4 w-4" />;
  case "manutencao": return <Settings className="h-4 w-4" />;
  case "rh": return <Users className="h-4 w-4" />;
  case "financeiro": return <DollarSign className="h-4 w-4" />;
  case "documentos": return <FileText className="h-4 w-4" />;
  case "compliance": return <Shield className="h-4 w-4" />;
  case "ia": return <Sparkles className="h-4 w-4" />;
  default: return <Bell className="h-4 w-4" />;
  }
};

// Stats Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle: string;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ title, value, icon, subtitle, onClick, isActive }) => (
  <Card 
    className={`bg-card/50 backdrop-blur border-border/50 cursor-pointer transition-all hover:border-primary/30 ${isActive ? "border-primary ring-1 ring-primary/20" : ""}`}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function NotificationCenterProfessional() {
  const { toast } = useToast();
  
  // States
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    criticalOnly: false,
    groupByCategory: false,
    autoArchive: true,
    autoArchiveDays: 30,
  });

  // Filter states
  const [filters, setFilters] = useState({
    types: [] as string[],
    categories: [] as string[],
    dateRange: "all",
    showRead: true,
    showUnread: true,
  });

  // AI Analysis
  const [aiSummary, setAiSummary] = useState("");

  // Computed values
  const stats = useMemo(() => ({
    total: notifications.filter(n => !n.isArchived).length,
    unread: notifications.filter(n => !n.isRead && !n.isArchived).length,
    critical: notifications.filter(n => n.type === "critical" && !n.isArchived).length,
    completed: notifications.filter(n => n.isRead && !n.isArchived).length,
    info: notifications.filter(n => n.type === "info" && !n.isArchived).length,
    starred: notifications.filter(n => n.isStarred && !n.isArchived).length,
  }), [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Tab filter
      if (activeTab === "unread" && n.isRead) return false;
      if (activeTab === "starred" && !n.isStarred) return false;
      if (activeTab === "archived" && !n.isArchived) return false;
      if (activeTab !== "archived" && n.isArchived) return false;
      
      // Type filter from stats
      if (selectedType && n.type !== selectedType) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!n.title.toLowerCase().includes(query) && !n.message.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Advanced filters
      if (filters.types.length > 0 && !filters.types.includes(n.type)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(n.category)) return false;
      if (!filters.showRead && n.isRead) return false;
      if (!filters.showUnread && !n.isRead) return false;
      
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, activeTab, selectedType, searchQuery, filters]);

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Atualizado", description: "Notificações atualizadas com sucesso." });
    }, 1000);
  }, [toast]);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast({ title: "Sucesso", description: "Todas as notificações foram marcadas como lidas." });
  }, [toast]);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  }, []);

  const handleMarkAsUnread = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: false } : n
    ));
  }, []);

  const handleToggleStar = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isStarred: !n.isStarred } : n
    ));
  }, []);

  const handleArchive = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isArchived: true } : n
    ));
    toast({ title: "Arquivado", description: "Notificação arquivada com sucesso." });
  }, [toast]);

  const handleUnarchive = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isArchived: false } : n
    ));
    toast({ title: "Restaurado", description: "Notificação restaurada." });
  }, [toast]);

  const handleDelete = useCallback((notification: Notification) => {
    setNotificationToDelete(notification);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (notificationToDelete) {
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
      toast({ title: "Excluído", description: "Notificação excluída permanentemente." });
      setIsDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  }, [notificationToDelete, toast]);

  const handleBulkAction = useCallback((action: "read" | "unread" | "archive" | "delete") => {
    if (selectedNotifications.length === 0) return;
    
    switch (action) {
    case "read":
      setNotifications(prev => prev.map(n => 
        selectedNotifications.includes(n.id) ? { ...n, isRead: true } : n
      ));
      toast({ title: "Sucesso", description: `${selectedNotifications.length} notificações marcadas como lidas.` });
      break;
    case "unread":
      setNotifications(prev => prev.map(n => 
        selectedNotifications.includes(n.id) ? { ...n, isRead: false } : n
      ));
      break;
    case "archive":
      setNotifications(prev => prev.map(n => 
        selectedNotifications.includes(n.id) ? { ...n, isArchived: true } : n
      ));
      toast({ title: "Sucesso", description: `${selectedNotifications.length} notificações arquivadas.` });
      break;
    case "delete":
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      toast({ title: "Sucesso", description: `${selectedNotifications.length} notificações excluídas.` });
      break;
    }
    setSelectedNotifications([]);
  }, [selectedNotifications, toast]);

  const handleSelectNotification = useCallback((id: string, selected: boolean) => {
    setSelectedNotifications(prev => 
      selected ? [...prev, id] : prev.filter(nId => nId !== id)
    );
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedNotifications(selected ? filteredNotifications.map(n => n.id) : []);
  }, [filteredNotifications]);

  const handleViewDetail = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailDialogOpen(true);
    handleMarkAsRead(notification.id);
  }, [handleMarkAsRead]);

  const handleAiAnalysis = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const unreadCritical = notifications.filter(n => !n.isRead && n.type === "critical").length;
      const unreadTotal = notifications.filter(n => !n.isRead).length;
      
      const { data, error } = await supabase.functions.invoke("nautilus-llm", {
        body: {
          prompt: `Analise as notificações do sistema: ${unreadTotal} não lidas, ${unreadCritical} críticas. Forneça um resumo executivo e recomendações de priorização.`,
          context: "notification_analysis",
        },
      });

      if (error) throw error;
      
      setAiSummary(data?.response || data?.text || `📊 **Resumo Executivo das Notificações**\n\n• Total não lidas: ${unreadTotal}\n• Notificações críticas: ${unreadCritical}\n\n**Recomendações:**\n1. Priorize as ${unreadCritical} notificações críticas imediatamente\n2. Revise alertas de compliance e certificados\n3. Configure auto-arquivamento para notificações informativas`);
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary(`📊 **Resumo Executivo das Notificações**\n\n• Total não lidas: ${stats.unread}\n• Notificações críticas: ${stats.critical}\n\n**Recomendações:**\n1. Priorize as notificações críticas imediatamente\n2. Revise alertas de compliance e certificados\n3. Configure auto-arquivamento para notificações informativas\n4. Ative notificações push para alertas críticos`);
    } finally {
      setIsAiLoading(false);
    }
  }, [notifications, stats]);

  const handleSaveSettings = useCallback(() => {
    toast({ title: "Configurações salvas", description: "Suas preferências foram atualizadas." });
    setIsSettingsDialogOpen(false);
  }, [toast]);

  const handleApplyFilters = useCallback(() => {
    toast({ title: "Filtros aplicados", description: "Os resultados foram atualizados." });
    setIsFiltersDialogOpen(false);
  }, [toast]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      types: [],
      categories: [],
      dateRange: "all",
      showRead: true,
      showUnread: true,
    });
    setSelectedType(null);
    setSearchQuery("");
    toast({ title: "Filtros limpos" });
  }, [toast]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              Central de Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as notificações e alertas do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => { setIsAiDialogOpen(true); handleAiAnalysis(); }}>
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Análise IA</TooltipContent>
            </Tooltip>

            <Button variant="outline" onClick={handleMarkAllAsRead} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Marcar Todas como Lidas</span>
            </Button>

            <Button variant="outline" onClick={handleSetIsSettingsDialogOpen} className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Button>

            <Button variant="outline" onClick={handleSetIsFiltersDialogOpen} className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
              {(filters.types.length > 0 || filters.categories.length > 0) && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {filters.types.length + filters.categories.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Não Lidas"
            value={stats.unread}
            icon={<Bell className="h-5 w-5 text-primary" />}
            subtitle="Novas notificações"
            onClick={handleSetSelectedType}
            isActive={selectedType === null}
          />
          <StatCard
            title="Críticas"
            value={stats.critical}
            icon={<AlertCircle className="h-5 w-5 text-destructive" />}
            subtitle="Requerem atenção"
            onClick={handleSetSelectedType}
            isActive={selectedType === "critical"}
          />
          <StatCard
            title="Concluídas"
            value={stats.completed}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            subtitle="Esta semana"
            onClick={handleSetSelectedType}
          />
          <StatCard
            title="Informativas"
            value={stats.info}
            icon={<Info className="h-5 w-5 text-blue-500" />}
            subtitle="Atualizações gerais"
            onClick={handleSetSelectedType}
            isActive={selectedType === "info"}
          />
        </div>

        {/* Main Content */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all" className="gap-2">
                      <Inbox className="h-4 w-4" />
                      Todas
                      {stats.total > 0 && <Badge variant="secondary" className="ml-1">{stats.total}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="gap-2">
                      <Bell className="h-4 w-4" />
                      Não Lidas
                      {stats.unread > 0 && <Badge className="ml-1">{stats.unread}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="starred" className="gap-2">
                      <Star className="h-4 w-4" />
                      Favoritas
                      {stats.starred > 0 && <Badge variant="secondary" className="ml-1">{stats.starred}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="gap-2">
                      <Archive className="h-4 w-4" />
                      Arquivadas
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar notificações..."
                    value={searchQuery}
                    onChange={handleChange}
                    className="pl-9 w-64 bg-background/50"
                  />
                </div>
                {selectedType && (
                  <Button variant="ghost" size="sm" onClick={handleSetSelectedType}>
                    Limpar filtro
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2 pt-3 border-t mt-3">
                <Checkbox
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedNotifications.length} selecionada(s)
                </span>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => handlehandleBulkAction}>
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como lida
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlehandleBulkAction}>
                  <Archive className="h-4 w-4 mr-1" />
                  Arquivar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handlehandleBulkAction}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            <ScrollArea className="h-[500px] pr-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BellOff className="h-12 w-12 mb-4 opacity-30" />
                  <h3 className="font-medium text-lg">Nenhuma notificação encontrada</h3>
                  <p className="text-sm mt-1">
                    {searchQuery ? "Tente ajustar sua busca" : "Você está em dia com tudo!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-4 rounded-lg border transition-all cursor-pointer ${
                        notification.isRead 
                          ? "bg-background/30 border-border/30" 
                          : "bg-primary/5 border-primary/20 hover:border-primary/40"
                      } ${selectedNotifications.includes(notification.id) ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handlehandleViewDetail}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={(checked) => {
                              handleSelectNotification(notification.id, !!checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="p-2 rounded-lg bg-background/50">
                            {getTypeIcon(notification.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`font-medium truncate ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                  {notification.title}
                                </h4>
                                {getTypeBadge(notification.type)}
                                {notification.isStarred && (
                                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {getCategoryIcon(notification.category)}
                                  {notification.source}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => { e.stopPropagation(); handleToggleStar(notification.id); }}
                                  >
                                    <Star className={`h-4 w-4 ${notification.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{notification.isStarred ? "Remover favorito" : "Favoritar"}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      notification.isRead ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id); 
                                    }}
                                  >
                                    {notification.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{notification.isRead ? "Marcar como não lida" : "Marcar como lida"}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      notification.isArchived ? handleUnarchive(notification.id) : handleArchive(notification.id);
                                    }}
                                  >
                                    {notification.isArchived ? <ArchiveX className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{notification.isArchived ? "Restaurar" : "Arquivar"}</TooltipContent>
                              </Tooltip>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handlehandleViewDetail}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver detalhes
                                  </DropdownMenuItem>
                                  {notification.action && (
                                    <DropdownMenuItem onClick={() => window.location.href = notification.action!.url}>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      {notification.action.label}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => {
                                    navigator.clipboard.writeText(notification.message);
                                    toast({ title: "Copiado!" });
                                  }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copiar mensagem
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handlehandleDelete}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {notification.action && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 gap-2"
                              onClick={(e) => { e.stopPropagation(); window.location.href = notification.action!.url; }}
                            >
                              {notification.action.label}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configurações de Notificações
              </DialogTitle>
              <DialogDescription>
                Configure suas preferências de notificação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Canais de Notificação</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Notificações por E-mail</Label>
                      <p className="text-xs text-muted-foreground">Receber alertas por e-mail</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Notificações Push</Label>
                      <p className="text-xs text-muted-foreground">Alertas em tempo real</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, pushNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Sons de Notificação</Label>
                      <p className="text-xs text-muted-foreground">Tocar som ao receber alertas</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.soundEnabled} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, soundEnabled: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Preferências</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Apenas Críticas</Label>
                    <p className="text-xs text-muted-foreground">Receber apenas notificações críticas</p>
                  </div>
                  <Switch 
                    checked={settings.criticalOnly} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, criticalOnly: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-arquivar</Label>
                    <p className="text-xs text-muted-foreground">Arquivar automaticamente após {settings.autoArchiveDays} dias</p>
                  </div>
                  <Switch 
                    checked={settings.autoArchive} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, autoArchive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Agrupar por Categoria</Label>
                    <p className="text-xs text-muted-foreground">Organizar notificações por tipo</p>
                  </div>
                  <Switch 
                    checked={settings.groupByCategory} 
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, groupByCategory: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsSettingsDialogOpen}>Cancelar</Button>
              <Button onClick={handleSaveSettings}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filtrar Notificações
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Tipo de Notificação</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["critical", "warning", "info", "success", "system"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${type}`}
                        checked={filters.types.includes(type)}
                        onCheckedChange={(checked) => {
                          setFilters(f => ({
                            ...f,
                            types: checked 
                              ? [...f.types, type] 
                              : f.types.filter(t => t !== type)
                          }));
                        }}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm capitalize">
                        {type === "critical" ? "Crítica" : 
                          type === "warning" ? "Atenção" : 
                            type === "success" ? "Sucesso" : 
                              type === "system" ? "Sistema" : "Info"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Categoria</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["operacoes", "manutencao", "rh", "financeiro", "documentos", "compliance", "ia"].map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`cat-${cat}`}
                        checked={filters.categories.includes(cat)}
                        onCheckedChange={(checked) => {
                          setFilters(f => ({
                            ...f,
                            categories: checked 
                              ? [...f.categories, cat] 
                              : f.categories.filter(c => c !== cat)
                          }));
                        }}
                      />
                      <label htmlFor={`cat-${cat}`} className="text-sm capitalize flex items-center gap-1">
                        {getCategoryIcon(cat)}
                        {cat === "operacoes" ? "Operações" :
                          cat === "manutencao" ? "Manutenção" :
                            cat === "rh" ? "RH" :
                              cat === "financeiro" ? "Financeiro" :
                                cat === "documentos" ? "Documentos" :
                                  cat === "compliance" ? "Compliance" : "IA"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Período</Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(f => ({ ...f, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Últimos 7 dias</SelectItem>
                    <SelectItem value="month">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Status de Leitura</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-read"
                      checked={filters.showRead}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, showRead: !!checked }))}
                    />
                    <label htmlFor="show-read" className="text-sm">Lidas</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-unread"
                      checked={filters.showUnread}
                      onCheckedChange={(checked) => setFilters(f => ({ ...f, showUnread: !!checked }))}
                    />
                    <label htmlFor="show-unread" className="text-sm">Não lidas</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClearFilters}>Limpar</Button>
              <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Dialog */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise de IA - Notificações
              </DialogTitle>
              <DialogDescription>
                Resumo inteligente das suas notificações
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isAiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3">Analisando notificações...</span>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Nautilus AI</span>
                  </div>
                  <div className="text-sm whitespace-pre-line">{aiSummary}</div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{stats.unread}</p>
                  <p className="text-xs text-muted-foreground">Não lidas</p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 text-center">
                  <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Críticas</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
                  <p className="text-xs text-muted-foreground">Favoritas</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsAiDialogOpen}>Fechar</Button>
              <Button onClick={handleAiAnalysis} disabled={isAiLoading}>
                {isAiLoading ? "Analisando..." : "Nova Análise"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {selectedNotification && getTypeIcon(selectedNotification.type)}
                </div>
                <div>
                  <DialogTitle>{selectedNotification?.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3" />
                    {selectedNotification && new Date(selectedNotification.createdAt).toLocaleString("pt-BR")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-2">
                {selectedNotification && getTypeBadge(selectedNotification.type)}
                <Badge variant="outline" className="gap-1">
                  {selectedNotification && getCategoryIcon(selectedNotification.category)}
                  {selectedNotification?.source}
                </Badge>
              </div>
              <p className="text-sm">{selectedNotification?.message}</p>
              
              {selectedNotification?.action && (
                <Button className="w-full gap-2" onClick={() => window.location.href = selectedNotification.action!.url}>
                  {selectedNotification.action.label}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => selectedNotification && handleToggleStar(selectedNotification.id)}
                >
                  <Star className={`h-4 w-4 ${selectedNotification?.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => selectedNotification && handleArchive(selectedNotification.id)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-destructive"
                  onClick={() => selectedNotification && handleDelete(selectedNotification)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleSetIsDetailDialogOpen}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Notificação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
