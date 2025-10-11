import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Hash,
  Users,
  Plus,
  Settings,
  Search,
  Lock,
  Unlock,
  MessageSquare,
  AlertTriangle,
  Building,
  Shield,
  Megaphone,
  Clock,
  Crown,
  UserCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: "group" | "department" | "broadcast" | "emergency";
  is_public: boolean;
  is_active: boolean;
  created_by: string;
  member_count: number;
  last_message_at?: string;
  settings: any;
  created_at: string;
}

interface ChannelMember {
  id: string;
  user_id: string;
  user_name?: string;
  role: "member" | "moderator" | "admin";
  joined_at: string;
  last_read_at?: string;
}

interface ChannelManagerProps {
  activeChannels: number;
  onStatsUpdate: (stats: any) => void;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({
  activeChannels,
  onStatsUpdate
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelMembers, setChannelMembers] = useState<ChannelMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isChannelDetailOpen, setIsChannelDetailOpen] = useState(false);
  const { toast } = useToast();

  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    type: "group" as const,
    is_public: true
  });

  const loadChannels = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock channels data - replace with real Supabase query
      const mockChannels: Channel[] = [
        {
          id: "1",
          name: "Geral",
          description: "Canal geral de comunicação da empresa",
          type: "broadcast",
          is_public: true,
          is_active: true,
          created_by: "admin",
          member_count: 156,
          last_message_at: new Date().toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          name: "RH - Recursos Humanos",
          description: "Comunicações oficiais do departamento de RH",
          type: "department",
          is_public: true,
          is_active: true,
          created_by: "hr-admin",
          member_count: 89,
          last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          name: "Operações Marítimas",
          description: "Canal para coordenação de operações e embarques",
          type: "department",
          is_public: false,
          is_active: true,
          created_by: "ops-admin",
          member_count: 34,
          last_message_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "4",
          name: "Emergência",
          description: "Canal de emergência - apenas para situações críticas",
          type: "emergency",
          is_public: true,
          is_active: true,
          created_by: "system",
          member_count: 78,
          last_message_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "5",
          name: "DPO Team",
          description: "Grupo privado para Dynamic Positioning Officers",
          type: "group",
          is_public: false,
          is_active: true,
          created_by: "dpo-lead",
          member_count: 12,
          last_message_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "6",
          name: "Máquinas e Engenharia",
          description: "Canal para engineers e equipe de máquinas",
          type: "department",
          is_public: false,
          is_active: true,
          created_by: "eng-admin",
          member_count: 28,
          last_message_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          settings: { notifications: true },
          created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setChannels(mockChannels);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar canais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const setupRealTimeSubscription = useCallback(() => {
    const channel = supabase
      .channel("channels-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communication_channels"
        },
        () => {
          loadChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadChannels]);

  const filterChannels = useCallback(() => {
    let filtered = [...channels];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    setFilteredChannels(filtered);
  }, [channels, searchTerm, selectedType]);

  useEffect(() => {
    loadChannels();
    setupRealTimeSubscription();
  }, [loadChannels, setupRealTimeSubscription]);

  useEffect(() => {
    filterChannels();
  }, [filterChannels]);

  const createChannel = async () => {
    try {
      if (!newChannel.name.trim()) {
        toast({
          title: "Erro",
          description: "Nome do canal é obrigatório",
          variant: "destructive"
        });
        return;
      }

      // Mock channel creation - replace with real Supabase insert
      const channel: Channel = {
        id: Date.now().toString(),
        name: newChannel.name,
        description: newChannel.description,
        type: newChannel.type,
        is_public: newChannel.is_public,
        is_active: true,
        created_by: "current-user",
        member_count: 1,
        settings: { notifications: true },
        created_at: new Date().toISOString()
      };

      setChannels(prev => [channel, ...prev]);
      setNewChannel({ name: "", description: "", type: "group", is_public: true });
      setIsNewChannelOpen(false);

      toast({
        title: "Sucesso",
        description: "Canal criado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar canal",
        variant: "destructive"
      });
    }
  };

  const joinChannel = async (channelId: string) => {
    try {
      // Mock join channel logic
      setChannels(prev => 
        prev.map(c => 
          c.id === channelId 
            ? { ...c, member_count: c.member_count + 1 }
            : c
        )
      );

      toast({
        title: "Sucesso",
        description: "Você entrou no canal"
      });
    } catch (error) {
      console.error("Failed to join channel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar no canal",
        variant: "destructive"
      });
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
    case "department": return Building;
    case "broadcast": return Megaphone;
    case "emergency": return AlertTriangle;
    case "group": return Users;
    default: return Hash;
    }
  };

  const getChannelTypeLabel = (type: string) => {
    switch (type) {
    case "department": return "Departamento";
    case "broadcast": return "Transmissão";
    case "emergency": return "Emergência";
    case "group": return "Grupo";
    default: return "Canal";
    }
  };

  const getChannelTypeColor = (type: string) => {
    switch (type) {
    case "emergency": return "bg-destructive text-destructive-foreground";
    case "department": return "bg-info text-info-foreground";
    case "broadcast": return "bg-warning text-warning-foreground";
    case "group": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Nunca";
    
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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Gerenciar Canais
            </CardTitle>
            <Dialog open={isNewChannelOpen} onOpenChange={setIsNewChannelOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Canal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Canal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Nome do Canal</Label>
                    <Input
                      placeholder="Ex: Equipe de Deck"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      placeholder="Descreva o propósito do canal..."
                      value={newChannel.description}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Tipo do Canal</Label>
                    <Select value={newChannel.type} onValueChange={(value: any) => setNewChannel(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Grupo</SelectItem>
                        <SelectItem value="department">Departamento</SelectItem>
                        <SelectItem value="broadcast">Transmissão</SelectItem>
                        <SelectItem value="emergency">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Canal Público</Label>
                    <Switch
                      checked={newChannel.is_public}
                      onCheckedChange={(checked) => setNewChannel(prev => ({ ...prev, is_public: checked }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewChannelOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createChannel}>
                      Criar Canal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar canais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="group">Grupos</SelectItem>
                <SelectItem value="department">Departamentos</SelectItem>
                <SelectItem value="broadcast">Transmissão</SelectItem>
                <SelectItem value="emergency">Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => {
          const ChannelIcon = getChannelIcon(channel.type);
          
          return (
            <Card 
              key={channel.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                setSelectedChannel(channel);
                setIsChannelDetailOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        channel.type === "emergency" ? "bg-destructive/10" :
                          channel.type === "department" ? "bg-info/10" :
                            channel.type === "broadcast" ? "bg-warning/10" :
                              "bg-success/10"
                      }`}>
                        <ChannelIcon className={`h-4 w-4 ${
                          channel.type === "emergency" ? "text-destructive" :
                            channel.type === "department" ? "text-info" :
                              channel.type === "broadcast" ? "text-warning" :
                                "text-success"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{channel.name}</h3>
                          {!channel.is_public && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <Badge 
                          className={`text-xs ${getChannelTypeColor(channel.type)}`}
                        >
                          {getChannelTypeLabel(channel.type)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedChannel(channel)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar canal
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Gerenciar membros
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir canal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {channel.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {channel.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {channel.member_count} membros
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(channel.last_message_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        joinChannel(channel.id);
                      }}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Entrar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredChannels.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum canal encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou crie um novo canal.
            </p>
            <Button onClick={() => setIsNewChannelOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Canal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Channel Detail Dialog */}
      <Dialog open={isChannelDetailOpen} onOpenChange={setIsChannelDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              {selectedChannel?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Badge className={getChannelTypeColor(selectedChannel.type)}>
                    {getChannelTypeLabel(selectedChannel.type)}
                  </Badge>
                </div>
                <div>
                  <Label>Membros</Label>
                  <p className="font-medium">{selectedChannel.member_count}</p>
                </div>
              </div>
              
              {selectedChannel.description && (
                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedChannel.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Última mensagem: {formatTimeAgo(selectedChannel.last_message_at)}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Abrir Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};