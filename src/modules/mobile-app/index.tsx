/**
 * PATCH: App Móvel Personalizado por Função
 * Interface adaptativa baseada no cargo do tripulante
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  Anchor, 
  Wrench, 
  Users,
  ShieldCheck,
  Stethoscope,
  ChefHat,
  Navigation,
  CheckCircle2,
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  QrCode,
  Camera,
  Mic,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

interface CrewRole {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  quickActions: { icon: React.ElementType; label: string; action: string }[];
}

const crewRoles: CrewRole[] = [
  {
    id: "captain",
    title: "Comandante",
    icon: Anchor,
    color: "text-blue-400",
    features: [
      "Dashboard de navegação completo",
      "Aprovações e autorizações",
      "Comunicação com armador",
      "Relatórios de viagem",
      "Alertas críticos prioritários"
    ],
    quickActions: [
      { icon: Navigation, label: "Status Navegação", action: "nav" },
      { icon: Bell, label: "Alertas", action: "alerts" },
      { icon: MessageSquare, label: "Comunicações", action: "comms" },
      { icon: FileText, label: "Relatórios", action: "reports" }
    ]
  },
  {
    id: "engineer",
    title: "Chefe de Máquinas",
    icon: Wrench,
    color: "text-orange-400",
    features: [
      "Monitoramento de equipamentos",
      "Ordens de serviço",
      "Leituras de instrumentos",
      "Controle de consumo",
      "Histórico de manutenção"
    ],
    quickActions: [
      { icon: Wrench, label: "Manutenção", action: "maintenance" },
      { icon: AlertTriangle, label: "Alarmes", action: "alarms" },
      { icon: Camera, label: "Inspeção Visual", action: "inspection" },
      { icon: QrCode, label: "Scan Peça", action: "scan" }
    ]
  },
  {
    id: "officer",
    title: "Oficial de Náutica",
    icon: Navigation,
    color: "text-cyan-400",
    features: [
      "Carta náutica digital",
      "Previsão meteorológica",
      "Log de navegação",
      "Checklist de quarto",
      "Comunicações VHF"
    ],
    quickActions: [
      { icon: Navigation, label: "Posição", action: "position" },
      { icon: Calendar, label: "Quarto", action: "watch" },
      { icon: FileText, label: "Log", action: "log" },
      { icon: MessageSquare, label: "VHF", action: "vhf" }
    ]
  },
  {
    id: "bosun",
    title: "Contramestre",
    icon: Users,
    color: "text-green-400",
    features: [
      "Gestão de convés",
      "Plano de trabalho",
      "Inventário de materiais",
      "Inspeções de segurança",
      "Distribuição de tarefas"
    ],
    quickActions: [
      { icon: Users, label: "Equipe", action: "team" },
      { icon: CheckCircle2, label: "Tarefas", action: "tasks" },
      { icon: ShieldCheck, label: "Segurança", action: "safety" },
      { icon: Camera, label: "Inspeção", action: "inspect" }
    ]
  },
  {
    id: "medical",
    title: "Oficial Médico",
    icon: Stethoscope,
    color: "text-red-400",
    features: [
      "Prontuários eletrônicos",
      "Estoque de medicamentos",
      "Telemedicina",
      "Protocolos de emergência",
      "Relatórios médicos"
    ],
    quickActions: [
      { icon: Stethoscope, label: "Consulta", action: "consult" },
      { icon: AlertTriangle, label: "Emergência", action: "emergency" },
      { icon: FileText, label: "Prontuário", action: "records" },
      { icon: Mic, label: "Telemedicina", action: "telemedicine" }
    ]
  },
  {
    id: "cook",
    title: "Cozinheiro",
    icon: ChefHat,
    color: "text-yellow-400",
    features: [
      "Cardápio semanal",
      "Controle de estoque",
      "Pedidos de provisões",
      "Restrições alimentares",
      "Registro de refeições"
    ],
    quickActions: [
      { icon: ChefHat, label: "Cardápio", action: "menu" },
      { icon: QrCode, label: "Estoque", action: "inventory" },
      { icon: Users, label: "Restrições", action: "dietary" },
      { icon: FileText, label: "Pedidos", action: "orders" }
    ]
  },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: "info" | "warning" | "critical";
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", title: "Manutenção Programada", message: "Motor auxiliar #2 - troca de óleo às 14h", time: new Date(Date.now() - 300000), type: "info", read: false },
  { id: "2", title: "Alerta Meteorológico", message: "Frente fria prevista para amanhã - ondas de 3m", time: new Date(Date.now() - 600000), type: "warning", read: false },
  { id: "3", title: "Documento Expirando", message: "Certificado de Rádio expira em 7 dias", time: new Date(Date.now() - 900000), type: "warning", read: true },
];

export default function MobileApp() {
  const [selectedRole, setSelectedRole] = useState<CrewRole>(crewRoles[0]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeView, setActiveView] = useState<string>("home");

  const handleQuickAction = (action: string) => {
    toast.success(`Abrindo: ${action}`);
    setActiveView(action);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas notificações marcadas como lidas");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            App Móvel por Função
          </h1>
          <p className="text-muted-foreground mt-1">
            Interface adaptativa para cada cargo a bordo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Bell className="h-4 w-4 mr-2" />
            {unreadCount} novas
          </Badge>
          <Button variant="outline" onClick={() => toast.info("Configurações do app")}>
            Configurar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Função</CardTitle>
            <CardDescription>Visualize o app por cargo</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {crewRoles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedRole.id === role.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${role.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{role.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {role.features.length} funcionalidades
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Mobile Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <selectedRole.icon className={`h-6 w-6 ${selectedRole.color}`} />
                <div>
                  <CardTitle>Preview: {selectedRole.title}</CardTitle>
                  <CardDescription>Interface personalizada</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Phone Frame */}
            <div className="max-w-sm mx-auto">
              <div className="border-4 border-muted rounded-[2.5rem] p-2 bg-background shadow-xl">
                <div className="bg-muted rounded-[2rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-muted/80 px-6 py-2 flex items-center justify-between text-xs">
                    <span>09:41</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>Lat -23.9</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="bg-primary/10 px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <selectedRole.icon className={`h-5 w-5 ${selectedRole.color}`} />
                        <span className="font-semibold text-sm">{selectedRole.title}</span>
                      </div>
                      <div className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-3">Ações Rápidas</p>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedRole.quickActions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <button
                            key={action.action}
                            onClick={() => handleQuickAction(action.label)}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="p-2 rounded-full bg-primary/10">
                              <ActionIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-[10px] text-center">{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground mb-2">Funcionalidades</p>
                    <div className="space-y-2">
                      {selectedRole.features.slice(0, 4).map((feature, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">Notificações</p>
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] text-primary"
                      >
                        Marcar lidas
                      </button>
                    </div>
                    <div className="space-y-2">
                      {notifications.slice(0, 2).map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-2 rounded-lg text-xs ${
                            notif.read ? 'bg-muted/30' : 'bg-primary/10 border border-primary/20'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.type === "critical" ? (
                              <AlertTriangle className="h-3 w-3 text-red-400 mt-0.5" />
                            ) : notif.type === "warning" ? (
                              <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5" />
                            ) : (
                              <Bell className="h-3 w-3 text-blue-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{notif.title}</p>
                              <p className="text-muted-foreground">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="bg-muted/80 px-4 py-3 flex items-center justify-around border-t border-border">
                    <button className="flex flex-col items-center gap-1 text-primary">
                      <Smartphone className="h-5 w-5" />
                      <span className="text-[10px]">Home</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span className="text-[10px]">Docs</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-[10px]">Chat</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span className="text-[10px]">Perfil</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos do App por Função</CardTitle>
          <CardDescription>Comparativo de funcionalidades disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {crewRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.id} className="p-4 rounded-lg border border-border text-center">
                  <div className={`p-3 rounded-full bg-muted inline-block mb-2 ${role.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-medium text-sm">{role.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {role.features.length} recursos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {role.quickActions.length} ações rápidas
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
