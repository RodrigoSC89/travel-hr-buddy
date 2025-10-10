import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Star,
  Archive,
  Trash2,
  Filter,
  Search,
  Eye,
  EyeOff,
  Shield,
  Zap,
  User,
  Building,
  Globe
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success" | "urgent";
  priority: "low" | "normal" | "high" | "critical";
  category: "system" | "message" | "reminder" | "alert" | "update";
  source: "system" | "user" | "ai" | "external";
  is_read: boolean;
  is_important: boolean;
  created_at: string;
  action_required: boolean;
  metadata?: any;
}

interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  sound_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  categories: Record<string, boolean>;
  priorities: Record<string, boolean>;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    sound_enabled: true,
    quiet_hours_enabled: false,
    quiet_start: "22:00",
    quiet_end: "08:00",
    categories: {
      system: true,
      message: true,
      reminder: true,
      alert: true,
      update: true
    },
    priorities: {
      low: true,
      normal: true,
      high: true,
      critical: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    loadSettings();
    setupRealTimeSubscription();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeTab, selectedType, selectedPriority]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Nova mensagem de RH",
          message: "Ana Silva enviou uma mensagem sobre atualização de dossiê",
          type: "info",
          priority: "normal",
          category: "message",
          source: "user",
          is_read: false,
          is_important: false,
          created_at: new Date().toISOString(),
          action_required: true
        },
        {
          id: "2",
          title: "Certificação expirando",
          message: "Sua certificação STCW Basic Safety Training expira em 15 dias",
          type: "warning",
          priority: "high",
          category: "reminder",
          source: "system",
          is_read: false,
          is_important: true,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          action_required: true
        },
        {
          id: "3",
          title: "Alerta de Emergência",
          message: "Tempestade severa detectada na rota Santos-Rio. Alteração de curso necessária.",
          type: "error",
          priority: "critical",
          category: "alert",
          source: "system",
          is_read: true,
          is_important: true,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          action_required: false
        },
        {
          id: "4",
          title: "Sugestão da IA",
          message: "Detectei padrões que sugerem otimização na programação de embarques",
          type: "info",
          priority: "normal",
          category: "update",
          source: "ai",
          is_read: false,
          is_important: false,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          action_required: false
        },
        {
          id: "5",
          title: "Sistema atualizado",
          message: "O módulo de comunicação foi atualizado com novas funcionalidades",
          type: "success",
          priority: "low",
          category: "system",
          source: "system",
          is_read: true,
          is_important: false,
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          action_required: false
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Mock settings loading - replace with real Supabase query
      // Settings are already initialized in state
    } catch (error) {
  }
  };

  const setupRealTimeSubscription = () => {
    // Mock real-time subscription for new notifications
    const interval = setInterval(() => {
      // Simulate new notification occasionally
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: "Nova notificação",
          message: "Esta é uma notificação de exemplo em tempo real",
          type: "info",
          priority: "normal",
          category: "system",
          source: "system",
          is_read: false,
          is_important: false,
          created_at: new Date().toISOString(),
          action_required: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast({
          title: newNotification.title,
          description: newNotification.message
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by tab
    switch (activeTab) {
    case "unread":
      filtered = filtered.filter(n => !n.is_read);
      break;
    case "important":
      filtered = filtered.filter(n => n.is_important);
      break;
    case "action":
      filtered = filtered.filter(n => n.action_required);
      break;
    case "archived":
      // Mock archived filter
      filtered = [];
      break;
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );
    } catch (error) {
  }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
  }
  };

  const toggleImportant = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_important: !n.is_important }
            : n
        )
      );
    } catch (error) {
  }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: "Sucesso",
        description: "Notificação removida"
      });
    } catch (error) {
  }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas"
      });
    } catch (error) {
  }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
    case "error": return AlertTriangle;
    case "warning": return AlertTriangle;
    case "success": return CheckCircle2;
    case "urgent": return Zap;
    default: return Info;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "critical") return "border-l-destructive bg-destructive/5";
    
    switch (type) {
    case "error": return "border-l-destructive bg-destructive/5";
    case "warning": return "border-l-warning bg-warning/5";
    case "success": return "border-l-success bg-success/5";
    case "urgent": return "border-l-warning bg-warning/5";
    default: return "border-l-info bg-info/5";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
    case "user": return User;
    case "ai": return Zap;
    case "external": return Globe;
    default: return Shield;
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

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const importantCount = notifications.filter(n => n.is_important).length;
  const actionCount = notifications.filter(n => n.action_required).length;

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
              <Bell className="h-5 w-5" />
              Central de Notificações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unreadCount} não lidas</Badge>
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
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
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Não Lidas
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="important" className="gap-2">
            Importantes
            {importantCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs">
                {importantCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="action" className="gap-2">
            Ação Necessária
            {actionCount > 0 && (
              <Badge variant="warning" className="h-5 w-5 p-0 text-xs">
                {actionCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Notifications List */}
        {["all", "unread", "important", "action"].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <div className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                    <p className="text-muted-foreground">
                      {tab === "unread" && "Todas as notificações foram lidas"}
                      {tab === "important" && "Nenhuma notificação marcada como importante"}
                      {tab === "action" && "Nenhuma ação pendente"}
                      {tab === "all" && "Nenhuma notificação encontrada"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map(notification => {
                  const NotificationIcon = getNotificationIcon(notification.type);
                  const SourceIcon = getSourceIcon(notification.source);
                  
                  return (
                    <Card 
                      key={notification.id}
                      className={`border-l-4 ${getNotificationColor(notification.type, notification.priority)} ${
                        !notification.is_read ? "shadow-md" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            notification.type === "error" ? "bg-destructive/10" :
                              notification.type === "warning" ? "bg-warning/10" :
                                notification.type === "success" ? "bg-success/10" :
                                  "bg-info/10"
                          }`}>
                            <NotificationIcon className={`h-4 w-4 ${
                              notification.type === "error" ? "text-destructive" :
                                notification.type === "warning" ? "text-warning" :
                                  notification.type === "success" ? "text-success" :
                                    "text-info"
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant={
                                    notification.priority === "critical" ? "destructive" :
                                      notification.priority === "high" ? "warning" :
                                        notification.priority === "normal" ? "secondary" :
                                          "outline"
                                  }
                                  className="text-xs"
                                >
                                  {notification.priority.toUpperCase()}
                                </Badge>
                                {notification.action_required && (
                                  <Badge variant="warning" className="text-xs">
                                    AÇÃO NECESSÁRIA
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <SourceIcon className="h-3 w-3" />
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(notification.created_at)}
                              </div>
                            </div>
                            
                            <p className={`text-sm ${!notification.is_read ? "font-medium" : "text-muted-foreground"} mb-3`}>
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {notification.source}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleImportant(notification.id)}
                                >
                                  <Star className={`h-4 w-4 ${notification.is_important ? "fill-current text-yellow-500" : ""}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
          </TabsContent>
        ))}

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Canais de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email</Label>
                  </div>
                  <Switch 
                    checked={settings.email_enabled}
                    onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>Push (Celular)</Label>
                  </div>
                  <Switch 
                    checked={settings.push_enabled}
                    onCheckedChange={(checked) => updateSettings({ push_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>SMS</Label>
                  </div>
                  <Switch 
                    checked={settings.sms_enabled}
                    onCheckedChange={(checked) => updateSettings({ sms_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.sound_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <Label>Som</Label>
                  </div>
                  <Switch 
                    checked={settings.sound_enabled}
                    onCheckedChange={(checked) => updateSettings({ sound_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horário de Silêncio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar horário de silêncio</Label>
                  <Switch 
                    checked={settings.quiet_hours_enabled}
                    onCheckedChange={(checked) => updateSettings({ quiet_hours_enabled: checked })}
                  />
                </div>
                
                {settings.quiet_hours_enabled && (
                  <div className="space-y-3">
                    <div>
                      <Label>Início</Label>
                      <Select 
                        value={settings.quiet_start} 
                        onValueChange={(value) => updateSettings({ quiet_start: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Fim</Label>
                      <Select 
                        value={settings.quiet_end} 
                        onValueChange={(value) => updateSettings({ quiet_end: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};