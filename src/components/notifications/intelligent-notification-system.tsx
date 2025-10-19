import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellRing, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Brain, 
  Filter, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  Users,
  Calendar,
  Star,
  Archive,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "ai_insight";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  source: string;
  metadata?: Record<string, unknown>;
}

const IntelligentNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    aiInsights: true,
    quietHours: { start: "22:00", end: "08:00" },
    categories: {
      security: true,
      financial: true,
      hr: true,
      operational: true,
      system: true
    }
  });
  const { toast } = useToast();

  // Simulação de notificações
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "Análise IA: Anomalia Detectada",
        message: "Sistema detectou padrão anômalo nos gastos do departamento de TI (+45% acima da média)",
        type: "ai_insight",
        priority: "high",
        category: "Financial",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionRequired: true,
        source: "AI Analytics Engine",
        metadata: { department: "TI", variance: 45 }
      },
      {
        id: "2",
        title: "Alerta de Segurança",
        message: "Tentativas de login falharam 5 vezes para o usuário admin@empresa.com",
        type: "warning",
        priority: "urgent",
        category: "Security",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        actionRequired: true,
        source: "Security Monitor"
      },
      {
        id: "3",
        title: "Certificado Expirando",
        message: "Certificado STCW do funcionário João Silva expira em 7 dias",
        type: "warning",
        priority: "medium",
        category: "HR",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        actionRequired: true,
        source: "HR System"
      },
      {
        id: "4",
        title: "Meta Atingida!",
        message: "Departamento de Vendas atingiu 110% da meta mensal",
        type: "success",
        priority: "medium",
        category: "Operational",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        actionRequired: false,
        source: "Performance Tracker"
      },
      {
        id: "5",
        title: "Recomendação IA",
        message: "Baseado nos dados, recomendamos aumentar o orçamento de marketing em 15%",
        type: "ai_insight",
        priority: "medium",
        category: "Strategic",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: false,
        actionRequired: false,
        source: "Strategic AI"
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "warning": return AlertTriangle;
    case "success": return CheckCircle;
    case "error": return AlertTriangle;
    case "ai_insight": return Brain;
    default: return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
    case "warning": return "text-orange-600";
    case "error": return "text-red-600";
    case "success": return "text-green-600";
    case "ai_insight": return "text-purple-600";
    default: return "text-blue-600";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case "urgent": return <Badge variant="destructive">Urgente</Badge>;
    case "high": return <Badge variant="default">Alta</Badge>;
    case "medium": return <Badge variant="secondary">Média</Badge>;
    default: return <Badge variant="outline">Baixa</Badge>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesPriority && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast({
      title: "Sucesso",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notificação removida",
      description: "A notificação foi removida com sucesso",
    });
  };

  const archiveNotification = (id: string) => {
    // Implementar lógica de arquivo
    deleteNotification(id);
  };

  const updateSettings = (key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Configurações atualizadas",
      description: "Suas preferências foram salvas",
    });
  };

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === "urgent" && !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8" />
              Notificações Inteligentes
            </h1>
            <p className="text-muted-foreground">
              {unreadCount} não lidas · {urgentCount} urgentes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
              {unreadCount} novas
            </Badge>
            {urgentCount > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {urgentCount} urgentes
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todas como lidas
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <BellRing className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:max-w-xs"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ai_insight">Insights IA</SelectItem>
                <SelectItem value="warning">Avisos</SelectItem>
                <SelectItem value="success">Sucessos</SelectItem>
                <SelectItem value="error">Erros</SelectItem>
                <SelectItem value="info">Informações</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Filtrar por prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <Card 
                  key={notification.id} 
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? "border-l-4 border-l-primary bg-muted/20" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full bg-muted ${getTypeColor(notification.type)}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${!notification.read ? "text-primary" : ""}`}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                            {notification.actionRequired && (
                              <Badge variant="outline">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Ação necessária
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRelativeTime(notification.timestamp)}
                            </span>
                            <span>Categoria: {notification.category}</span>
                            <span>Origem: {notification.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => archiveNotification(notification.id)}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Insights Gerados por IA
              </CardTitle>
              <CardDescription>
                Análises inteligentes baseadas nos dados da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications
                .filter(n => n.type === "ai_insight")
                .map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          {insight.message}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                          <Button size="sm">
                            Implementar Sugestão
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Notificação</CardTitle>
                <CardDescription>Configure como você quer receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <Label>Email</Label>
                  </div>
                  <Switch 
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => updateSettings("emailEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <Label>Push Notifications</Label>
                  </div>
                  <Switch 
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => updateSettings("pushEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <Label>SMS</Label>
                  </div>
                  <Switch 
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => updateSettings("smsEnabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <Label>Insights IA</Label>
                  </div>
                  <Switch 
                    checked={settings.aiInsights}
                    onCheckedChange={(checked) => updateSettings("aiInsights", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
                <CardDescription>Escolha quais tipos de notificação você quer receber</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label className="capitalize">{category}</Label>
                    <Switch 
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        updateSettings("categories", { ...settings.categories, [category]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Horário Silencioso</CardTitle>
              <CardDescription>Defina um período em que não receberá notificações (exceto urgentes)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Início</Label>
                  <Input 
                    type="time" 
                    value={settings.quietHours.start}
                    onChange={(e) => 
                      updateSettings("quietHours", { ...settings.quietHours, start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input 
                    type="time" 
                    value={settings.quietHours.end}
                    onChange={(e) => 
                      updateSettings("quietHours", { ...settings.quietHours, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentNotificationSystem;