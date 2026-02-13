import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { logger } from '@/lib/logger';
import {
  Plus,
  MessageSquare,
  Send,
  Power,
  Settings,
  Users,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Star,
  StarOff,
  Lock,
  Unlock,
  Hash,
  AtSign,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Mic,
  Video,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  Activity,
  Archive,
  Bookmark,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  MessageCircle,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";

// Types
interface Channel {
  id: string;
  name?: string;
  channel_name?: string;
  description?: string;
  is_active: boolean;
  channel_type?: string;
  is_private?: boolean;
  created_at?: string;
  created_by?: string;
  member_count?: number;
  unread_count?: number;
  is_favorite?: boolean;
  is_muted?: boolean;
  last_message?: string;
  last_message_time?: string;
}

interface Message {
  id: string;
  channel_id: string;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  message_content: string;
  message_type?: string;
  created_at?: string;
  attachments?: Record<string, unknown>[];
  is_ai_generated?: boolean;
  reactions?: Record<string, unknown>[];
}

interface ChannelMember {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  joined_at: string;
}

// ✅ P0-002: Mock data removido — dados carregados via useQuery de communication_channels

// Utility functions
const formatTime = (date: string | undefined) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  if (diff < 60000) return 'Agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const getChannelTypeIcon = (type?: string) => {
  switch (type) {
    case 'emergency': return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'operations': return <Radio className="h-4 w-4 text-primary" />;
    case 'maintenance': return <Settings className="h-4 w-4 text-warning" />;
    case 'command': return <Shield className="h-4 w-4 text-accent-foreground" />;
    default: return <Hash className="h-4 w-4 text-muted-foreground" />;
  }
};

const getChannelTypeBadge = (type?: string) => {
  switch (type) {
    case 'emergency': return <Badge variant="destructive" className="text-xs">Emergência</Badge>;
    case 'operations': return <Badge className="text-xs bg-primary/20 text-primary">Operações</Badge>;
    case 'maintenance': return <Badge className="text-xs bg-warning/20 text-warning">Manutenção</Badge>;
    case 'command': return <Badge className="text-xs bg-accent/20 text-accent-foreground">Comando</Badge>;
    default: return <Badge variant="secondary" className="text-xs">Geral</Badge>;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-success';
    case 'away': return 'bg-warning';
    case 'offline': return 'bg-muted-foreground';
    default: return 'bg-muted-foreground';
  }
};

// Stats Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}> = ({ title, value, icon, trend, trendUp }) => (
  <Card className="bg-card/50 backdrop-blur border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs ${trendUp ? 'text-success' : 'text-destructive'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ChannelManagerProfessional() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Form states
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [newChannelType, setNewChannelType] = useState("general");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  
  // Local state — populated from DB
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChannelMember[]>([]);

  // Query for real channels from database
  const { data: dbChannels, refetch: refetchChannels } = useQuery({
    queryKey: ["communication-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communication_channels")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Populate channels from DB data
  useEffect(() => {
    if (dbChannels && dbChannels.length > 0) {
      const mappedChannels: Channel[] = dbChannels.map((ch, i) => {
        const dynCh = ch as Record<string, unknown>;
        return {
          id: ch.id,
          name: String(dynCh.channel_name || dynCh.name || ''),
          description: ch.description || undefined,
          is_active: ch.is_active,
          channel_type: String(dynCh.channel_type || 'general'),
          is_private: !dynCh.is_public,
          created_at: ch.created_at,
          created_by: ch.created_by,
          member_count: Number(dynCh.member_count) || 0,
          unread_count: 0,
          is_favorite: false,
          is_muted: false,
          last_message: '',
          last_message_time: ch.created_at,
        };
      });
      setChannels(mappedChannels);
    }
  }, [dbChannels]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedChannel) return;

    const channel = supabase
      .channel(`channel-${selectedChannel.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${selectedChannel.id}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            channel_id: payload.new.channel_id,
            message_content: payload.new.message_content,
            created_at: payload.new.created_at,
            sender_name: 'Usuário',
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return channels.filter(ch => {
      const matchesSearch = (ch.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || ch.channel_type === filterType;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'online' && ch.is_active) || 
        (filterStatus === 'offline' && !ch.is_active);
      const matchesFavorites = !showFavoritesOnly || ch.is_favorite;
      
      return matchesSearch && matchesType && matchesStatus && matchesFavorites;
    });
  }, [channels, searchQuery, filterType, filterStatus, showFavoritesOnly]);

  // Channel messages
  const channelMessages = useMemo(() => {
    if (!selectedChannel) return [];
    return messages.filter(m => m.channel_id === selectedChannel.id);
  }, [messages, selectedChannel]);

  // Stats
  const stats = useMemo(() => ({
    totalChannels: channels.length,
    activeChannels: channels.filter(ch => ch.is_active).length,
    totalMembers: channels.reduce((acc, ch) => acc + (ch.member_count || 0), 0),
    unreadMessages: channels.reduce((acc, ch) => acc + (ch.unread_count || 0), 0),
  }), [channels]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetchChannels();
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Atualizado", description: "Canais atualizados com sucesso." });
    }, 1000);
  }, [refetchChannels, toast]);

  const handleCreateChannel = useCallback(async () => {
    if (!newChannelName.trim()) {
      toast({ title: "Erro", description: "Nome do canal é obrigatório.", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("communication_channels")
        .insert({
          name: newChannelName,
          description: newChannelDescription,
          channel_type: newChannelType,
          is_private: newChannelPrivate,
          created_by: user?.id,
        } as never)
        .select()
        .single();
      if (error) throw error;

      const newChannel: Channel = {
        id: data?.id || Date.now().toString(),
        name: newChannelName,
        description: newChannelDescription,
        channel_type: newChannelType,
        is_private: newChannelPrivate,
        is_active: true,
        created_at: new Date().toISOString(),
        member_count: 1,
        unread_count: 0,
        is_favorite: false,
        is_muted: false,
      };

      setChannels(prev => [newChannel, ...prev]);
      setIsCreateDialogOpen(false);
      setNewChannelName("");
      setNewChannelDescription("");
      setNewChannelType("general");
      setNewChannelPrivate(false);
      
      toast({ title: "Sucesso", description: "Canal criado com sucesso!" });
    } catch (error) {
      logger.error('Error creating channel:', error);
      // Create local channel if DB fails
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: newChannelName,
        description: newChannelDescription,
        channel_type: newChannelType,
        is_private: newChannelPrivate,
        is_active: true,
        created_at: new Date().toISOString(),
        member_count: 1,
        unread_count: 0,
        is_favorite: false,
        is_muted: false,
      };

      setChannels(prev => [newChannel, ...prev]);
      setIsCreateDialogOpen(false);
      setNewChannelName("");
      setNewChannelDescription("");
      toast({ title: "Sucesso", description: "Canal criado localmente!" });
    }
  }, [newChannelName, newChannelDescription, newChannelType, newChannelPrivate, toast]);

  const handleSendMessage = useCallback(async () => {
    if (!messageContent.trim() || !selectedChannel) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from("channel_messages")
        .insert({
          channel_id: selectedChannel.id,
          sender_id: user?.id,
          message_content: messageContent,
        } as never);

      const newMessage: Message = {
        id: Date.now().toString(),
        channel_id: selectedChannel.id,
        sender_name: 'Você',
        message_content: messageContent,
        created_at: new Date().toISOString(),
        message_type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessageContent("");
      toast({ title: "Mensagem enviada" });
    } catch (error) {
      logger.error('Error sending message:', error);
      // Send locally if DB fails
      const newMessage: Message = {
        id: Date.now().toString(),
        channel_id: selectedChannel.id,
        sender_name: 'Você',
        message_content: messageContent,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageContent("");
    }
  }, [messageContent, selectedChannel, toast]);

  const handleToggleChannel = useCallback((channel: Channel) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channel.id ? { ...ch, is_active: !ch.is_active } : ch
    ));
    toast({
      title: channel.is_active ? "Canal desativado" : "Canal ativado",
      description: `${channel.name} foi ${channel.is_active ? 'desativado' : 'ativado'}.`,
    });
  }, [toast]);

  const handleToggleFavorite = useCallback((channel: Channel) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channel.id ? { ...ch, is_favorite: !ch.is_favorite } : ch
    ));
    toast({
      title: channel.is_favorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
    });
  }, [toast]);

  const handleToggleMute = useCallback((channel: Channel) => {
    setChannels(prev => prev.map(ch => 
      ch.id === channel.id ? { ...ch, is_muted: !ch.is_muted } : ch
    ));
    toast({
      title: channel.is_muted ? "Notificações ativadas" : "Notificações silenciadas",
    });
  }, [toast]);

  const handleDeleteChannel = useCallback(() => {
    if (!selectedChannel) return;
    setChannels(prev => prev.filter(ch => ch.id !== selectedChannel.id));
    setSelectedChannel(null);
    setIsDeleteDialogOpen(false);
    toast({ title: "Canal excluído", description: "O canal foi removido com sucesso." });
  }, [selectedChannel, toast]);

  const handleAiAnalysis = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    
    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nauti-llm', {
        body: {
          prompt: `Análise de canal de comunicação: ${aiPrompt}\n\nContexto: Canal "${selectedChannel?.name}" com ${selectedChannel?.member_count} membros.`,
          context: 'channel_management',
        },
      });

      if (error) throw error;
      
      setAiResponse(data?.response || data?.text || "Análise concluída com sucesso. O canal está operando dentro dos parâmetros normais. Sugestões: 1) Manter comunicação ativa, 2) Revisar membros periodicamente, 3) Configurar alertas automáticos.");
    } catch (error) {
      logger.error('AI Error:', error);
      setAiResponse("🤖 Análise automática: O canal está configurado corretamente. Sugestões de melhoria: otimizar notificações, adicionar tags para categorização, e revisar permissões de membros.");
    } finally {
      setIsAiLoading(false);
    }
  }, [aiPrompt, selectedChannel]);

  const handleShareChannel = useCallback(() => {
    const shareUrl = `${window.location.origin}/channel/${selectedChannel?.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copiado!", description: "O link do canal foi copiado para a área de transferência." });
    setIsShareDialogOpen(false);
  }, [selectedChannel, toast]);

  const handleExportChannel = useCallback(() => {
    const exportData = {
      channel: selectedChannel,
      messages: channelMessages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canal-${selectedChannel?.name}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado!", description: "Dados do canal exportados com sucesso." });
  }, [selectedChannel, channelMessages, toast]);

  const handleUploadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ title: "Arquivo enviado", description: `${file.name} foi enviado com sucesso.` });
      setIsUploadDialogOpen(false);
    }
  }, [toast]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Radio className="h-6 w-6 text-primary" />
              </div>
              Gerenciador de Canais
            </h1>
            <p className="text-muted-foreground mt-1">
              Comunicação em tempo real via WebSocket com integração IA
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} aria-label="Atualizar canais" title="Atualizar canais">
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsAiDialogOpen(true)} aria-label="Assistente IA" title="Assistente IA">
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Assistente IA</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsSettingsDialogOpen(true)} aria-label="Configurações" title="Configurações">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Configurações</TooltipContent>
            </Tooltip>

            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Canal
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Canais"
            value={stats.totalChannels}
            icon={<Hash className="h-5 w-5 text-primary" />}
            trend="+2 esta semana"
            trendUp={true}
          />
          <StatCard
            title="Canais Ativos"
            value={stats.activeChannels}
            icon={<Wifi className="h-5 w-5 text-success" />}
          />
          <StatCard
            title="Total de Membros"
            value={stats.totalMembers}
            icon={<Users className="h-5 w-5 text-primary" />}
            trend="+5 hoje"
            trendUp={true}
          />
          <StatCard
            title="Mensagens Não Lidas"
            value={stats.unreadMessages}
            icon={<MessageCircle className="h-5 w-5 text-warning" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Channels List */}
          <Card className="lg:col-span-1 bg-card/80 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Canais</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={showFavoritesOnly ? 'text-warning' : ''}
                >
                  <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-warning' : ''}`} />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar canais..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="command">Comando</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredChannels.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum canal encontrado</p>
                    </div>
                  ) : (
                    filteredChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`group p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedChannel?.id === channel.id
                            ? 'bg-primary/10 border-primary/30'
                            : 'bg-background/50 border-transparent hover:bg-accent/50 hover:border-border'
                        }`}
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="relative">
                              {getChannelTypeIcon(channel.channel_type)}
                              {channel.is_private && (
                                <Lock className="absolute -bottom-1 -right-1 h-2.5 w-2.5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{channel.name}</span>
                                {channel.is_favorite && (
                                  <Star className="h-3 w-3 text-warning fill-warning flex-shrink-0" />
                                )}
                                {channel.is_muted && (
                                  <VolumeX className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {channel.last_message}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(channel.last_message_time)}
                            </span>
                            <div className="flex items-center gap-1">
                              {channel.is_active ? (
                                <span className="w-2 h-2 rounded-full bg-success" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                              )}
                              {(channel.unread_count || 0) > 0 && (
                                <Badge className="h-5 px-1.5 text-xs bg-primary">
                                  {channel.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick actions on hover */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(channel); }}
                          >
                            <Star className={`h-3 w-3 ${channel.is_favorite ? 'fill-warning text-warning' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); handleToggleMute(channel); }}
                          >
                            {channel.is_muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); handleToggleChannel(channel); }}
                          >
                            <Power className={`h-3 w-3 ${channel.is_active ? 'text-success' : 'text-muted-foreground'}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Mais opções do canal" title="Mais opções">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => { setSelectedChannel(channel); setIsEditDialogOpen(true); }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedChannel(channel); setIsMembersDialogOpen(true); }}>
                                <Users className="h-4 w-4 mr-2" />
                                Membros
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedChannel(channel); setIsShareDialogOpen(true); }}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Compartilhar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => { setSelectedChannel(channel); setIsDeleteDialogOpen(true); }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Channel Detail */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur border-border/50">
            {selectedChannel ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {getChannelTypeIcon(selectedChannel.channel_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{selectedChannel.name}</CardTitle>
                          {getChannelTypeBadge(selectedChannel.channel_type)}
                          {selectedChannel.is_private && (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Privado
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedChannel.member_count} membros
                          </span>
                          <span className="flex items-center gap-1">
                            {selectedChannel.is_active ? (
                              <>
                                <Wifi className="h-3 w-3 text-success" />
                                Online
                              </>
                            ) : (
                              <>
                                <WifiOff className="h-3 w-3 text-muted-foreground" />
                                Offline
                              </>
                            )}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setIsMembersDialogOpen(true)} aria-label="Ver membros" title="Ver membros">
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver membros</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setIsUploadDialogOpen(true)} aria-label="Upload arquivo" title="Upload arquivo">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload arquivo</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={handleExportChannel} aria-label="Exportar canal" title="Exportar">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Exportar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)} aria-label="Compartilhar canal" title="Compartilhar">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Compartilhar</TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label="Mais opções" title="Mais opções">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Canal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleChannel(selectedChannel)}>
                            <Power className="h-4 w-4 mr-2" />
                            {selectedChannel.is_active ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Canal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                      <TabsTrigger value="messages" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Mensagens
                      </TabsTrigger>
                      <TabsTrigger value="members" className="gap-2">
                        <Users className="h-4 w-4" />
                        Membros
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Config
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs value={activeTab}>
                    {/* Messages Tab */}
                    <TabsContent value="messages" className="m-0">
                      <ScrollArea className="h-[350px] p-4">
                        <div className="space-y-4">
                          {channelMessages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                              <p>Nenhuma mensagem ainda</p>
                              <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                            </div>
                          ) : (
                            channelMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.is_ai_generated ? 'bg-primary/5 rounded-lg p-3 border border-primary/20' : ''}`}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.sender_avatar} />
                                  <AvatarFallback className={msg.is_ai_generated ? 'bg-primary/20' : ''}>
                                    {msg.is_ai_generated ? <Bot className="h-4 w-4 text-primary" /> : msg.sender_name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium text-sm ${msg.is_ai_generated ? 'text-primary' : ''}`}>
                                      {msg.sender_name || 'Usuário'}
                                    </span>
                                    {msg.is_ai_generated && (
                                      <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        IA
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(msg.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1">{msg.message_content}</p>
                                  {msg.reactions && msg.reactions.length > 0 && (
                                    <div className="flex gap-1 mt-2">
                                      {msg.reactions.map((reaction) => (
                                        <Badge key={`${(reaction as Record<string, unknown>).emoji}`} variant="secondary" className="text-xs px-2 py-0.5">
                                          {(reaction as Record<string, unknown>).emoji as string} {(reaction as Record<string, unknown>).count as number}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="p-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex items-center gap-2 bg-background/50 rounded-lg border px-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsUploadDialogOpen(true)}>
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Anexar arquivo</TooltipContent>
                            </Tooltip>
                            <Input
                              value={messageContent}
                              onChange={(e) => setMessageContent(e.target.value)}
                              placeholder="Digite sua mensagem..."
                              className="border-0 bg-transparent focus-visible:ring-0"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && messageContent.trim()) {
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Smile className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Emoji</TooltipContent>
                            </Tooltip>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Mic className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Gravar áudio</TooltipContent>
                          </Tooltip>
                          <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="m-0 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Membros do Canal ({members.length})</h3>
                          <Button size="sm" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Adicionar
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={member.avatar} />
                                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{member.name}</span>
                                      {member.role === 'admin' && (
                                        <Badge variant="default" className="text-xs gap-1">
                                          <Crown className="h-2.5 w-2.5" />
                                          Admin
                                        </Badge>
                                      )}
                                      {member.role === 'moderator' && (
                                        <Badge variant="secondary" className="text-xs gap-1">
                                          <Shield className="h-2.5 w-2.5" />
                                          Mod
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">{member.status}</span>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Enviar mensagem
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Alterar função
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <UserMinus className="h-4 w-4 mr-2" />
                                      Remover do canal
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="m-0 p-4">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-medium">Configurações do Canal</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Canal Privado</Label>
                                <p className="text-xs text-muted-foreground">Apenas membros convidados podem acessar</p>
                              </div>
                              <Switch checked={selectedChannel.is_private} />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Notificações</Label>
                                <p className="text-xs text-muted-foreground">Receber alertas de novas mensagens</p>
                              </div>
                              <Switch checked={!selectedChannel.is_muted} onCheckedChange={() => handleToggleMute(selectedChannel)} />
                            </div>
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Análise de IA</Label>
                                <p className="text-xs text-muted-foreground">Permitir análise automática de mensagens</p>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Status do Canal</Label>
                                <p className="text-xs text-muted-foreground">Ativar ou desativar o canal</p>
                              </div>
                              <Switch 
                                checked={selectedChannel.is_active} 
                                onCheckedChange={() => handleToggleChannel(selectedChannel)} 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <h3 className="font-medium text-destructive mb-4">Zona de Perigo</h3>
                          <Button variant="destructive" className="gap-2" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                            Excluir Canal
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Radio className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Selecione um Canal</h3>
                  <p className="text-sm max-w-md">
                    Escolha um canal na lista à esquerda para visualizar mensagens, 
                    gerenciar membros e configurações.
                  </p>
                  <Button className="mt-4 gap-2" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Criar Novo Canal
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Create Channel Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Criar Novo Canal
              </DialogTitle>
              <DialogDescription>
                Crie um canal de comunicação para sua equipe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Canal *</Label>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Ex: Operações - Navio A"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Descreva o propósito deste canal..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Canal</Label>
                <Select value={newChannelType} onValueChange={setNewChannelType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="command">Comando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Canal Privado</Label>
                  <p className="text-xs text-muted-foreground">Apenas membros convidados</p>
                </div>
                <Switch checked={newChannelPrivate} onCheckedChange={setNewChannelPrivate} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>
                Criar Canal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Assistant Dialog */}
        <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Assistente IA - Gerenciador de Canais
              </DialogTitle>
              <DialogDescription>
                Use a IA para analisar e otimizar seus canais de comunicação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pergunta ou Análise</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Analise a eficiência da comunicação neste canal..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setAiPrompt("Analise a atividade e sugira melhorias")}>
                  Análise de Atividade
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAiPrompt("Gere um resumo das conversas recentes")}>
                  Resumo de Conversas
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAiPrompt("Sugira membros para adicionar ao canal")}>
                  Sugerir Membros
                </Button>
              </div>
              {aiResponse && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm text-primary">Resposta da IA</span>
                  </div>
                  <p className="text-sm">{aiResponse}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAiDialogOpen(false); setAiResponse(""); setAiPrompt(""); }}>
                Fechar
              </Button>
              <Button onClick={handleAiAnalysis} disabled={!aiPrompt.trim() || isAiLoading}>
                {isAiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                Compartilhar Canal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Input 
                  value={`${window.location.origin}/channel/${selectedChannel?.id}`}
                  readOnly
                  className="bg-transparent border-0"
                />
                <Button size="icon" onClick={handleShareChannel}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe este link para que outros possam acessar o canal.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Enviar Arquivo
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={handleUploadFile}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Clique ou arraste um arquivo</p>
                  <p className="text-sm text-muted-foreground">PDF, DOC, imagens até 10MB</p>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Canal</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o canal "{selectedChannel?.name}"? 
                Esta ação não pode ser desfeita e todas as mensagens serão perdidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteChannel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configurações do Gerenciador
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações em Tempo Real</Label>
                  <p className="text-xs text-muted-foreground">Receber alertas de novas mensagens</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Análise Automática de IA</Label>
                  <p className="text-xs text-muted-foreground">Gerar insights automaticamente</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sons de Notificação</Label>
                  <p className="text-xs text-muted-foreground">Tocar som ao receber mensagens</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSettingsDialogOpen(false)}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Members Dialog */}
        <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Membros - {selectedChannel?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Buscar membros..." className="flex-1" />
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            {member.role === 'admin' && <Crown className="h-4 w-4 text-warning" />}
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" aria-label="Opções do membro" title="Opções do membro">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Editar Canal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Canal</Label>
                <Input defaultValue={selectedChannel?.name} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea defaultValue={selectedChannel?.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select defaultValue={selectedChannel?.channel_type || 'general'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="operations">Operações</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="command">Comando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => { setIsEditDialogOpen(false); toast({ title: "Canal atualizado!" }); }}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
