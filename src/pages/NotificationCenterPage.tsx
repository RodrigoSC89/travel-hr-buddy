/**
 * Notification Center Page - Full View
 * Complete notification management with preferences
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info,
  Trash2,
  Settings,
  Mail,
  Smartphone,
  MessageSquare,
  Volume2
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  category: "alert" | "reminder" | "info" | "urgent";
  priority: "low" | "normal" | "high" | "urgent";
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Certificado Expirando",
    message: "O certificado STCW de João Silva expira em 15 dias.",
    category: "alert",
    priority: "high",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    actionUrl: "/certificates",
    actionLabel: "Ver Certificado"
  },
  {
    id: "2",
    title: "Manutenção Agendada",
    message: "Manutenção preventiva do motor principal programada para amanhã.",
    category: "reminder",
    priority: "normal",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    actionUrl: "/maintenance-command",
    actionLabel: "Ver Detalhes"
  },
  {
    id: "3",
    title: "Nova Atualização do Sistema",
    message: "Versão 4.1 do Nauti One está disponível com melhorias de performance.",
    category: "info",
    priority: "low",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4",
    title: "Alerta Meteorológico",
    message: "Condições adversas previstas na rota atual. Recomenda-se revisão.",
    category: "urgent",
    priority: "urgent",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    actionUrl: "/weather-command",
    actionLabel: "Ver Previsão"
  },
];

export default function NotificationCenterPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    alerts: true,
    reminders: true,
    info: true,
    marketing: false,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "07:00",
    digest: false,
    digestFrequency: "daily"
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "Todas marcadas como lidas",
      description: `${unreadCount} notificações marcadas.`,
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notificação removida",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "alert": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "urgent": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "reminder": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "alert": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "urgent": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "reminder": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "";
    }
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : activeTab === "unread"
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.category === activeTab);

  return (
    <ModulePageWrapper gradient="blue">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Central de Notificações</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas as notificações lidas"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Preferências
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">
                      Todas
                      <Badge variant="secondary" className="ml-2">
                        {notifications.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Não lidas
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-primary">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="alert">Alertas</TabsTrigger>
                    <TabsTrigger value="urgent">Urgentes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma notificação</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            notification.read 
                              ? "bg-muted/50" 
                              : "bg-card hover:bg-accent/50 border-primary/20"
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {getCategoryIcon(notification.category)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${!notification.read && "text-foreground"}`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getCategoryColor(notification.category)}`}
                                >
                                  {notification.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {format(notification.createdAt, "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                </span>
                                <div className="flex items-center gap-2">
                                  {notification.actionUrl && (
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                      {notification.actionLabel || "Ver"}
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Preferences Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Canais de Notificação</CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label>In-App</Label>
                  </div>
                  <Switch 
                    checked={preferences.inApp} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, inApp: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email</Label>
                  </div>
                  <Switch 
                    checked={preferences.email} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, email: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label>Push</Label>
                  </div>
                  <Switch 
                    checked={preferences.push} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, push: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>SMS</Label>
                  </div>
                  <Switch 
                    checked={preferences.sms} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, sms: v}))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
                <CardDescription>
                  Tipos de notificações que deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Alertas</Label>
                  <Switch 
                    checked={preferences.alerts} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, alerts: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Lembretes</Label>
                  <Switch 
                    checked={preferences.reminders} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, reminders: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Informações</Label>
                  <Switch 
                    checked={preferences.info} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, info: v}))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Marketing</Label>
                  <Switch 
                    checked={preferences.marketing} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, marketing: v}))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Horário Silencioso</CardTitle>
                <CardDescription>
                  Pausar notificações durante horários específicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar</Label>
                  <Switch 
                    checked={preferences.quietHours} 
                    onCheckedChange={(v) => setPreferences(p => ({...p, quietHours: v}))}
                  />
                </div>
                {preferences.quietHours && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <Label className="text-xs">Início</Label>
                      <input 
                        type="time" 
                        value={preferences.quietStart}
                        onChange={(e) => setPreferences(p => ({...p, quietStart: e.target.value}))}
                        className="w-full mt-1 px-2 py-1 rounded border bg-background text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fim</Label>
                      <input 
                        type="time" 
                        value={preferences.quietEnd}
                        onChange={(e) => setPreferences(p => ({...p, quietEnd: e.target.value}))}
                        className="w-full mt-1 px-2 py-1 rounded border bg-background text-sm"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
