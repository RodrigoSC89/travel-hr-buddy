import { useEffect, useMemo, useState, useCallback } from "react";;;
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { 
  MessageSquare, 
  Bell,
  Radio,
  Hash,
  Users,
  Send,
  Settings,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sparkles,
  Target,
  Inbox,
  AlertCircle,
  Star,
  Archive,
  Clock,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import existing components
import { CommunicationCenterProfessional } from "@/components/communication/CommunicationCenterProfessional";
import ChannelManagerProfessional from "@/components/channel-manager/ChannelManagerProfessional";
import NotificationCenterProfessional from "@/components/unified/NotificationCenter.unified";

interface CommandStats {
  totalMessages: number;
  unreadMessages: number;
  totalChannels: number;
  activeChannels: number;
  totalNotifications: number;
  criticalNotifications: number;
  urgentMessages: number;
  todayMessages: number;
}

const CommunicationCommandCenter = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<CommandStats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalChannels: 0,
    activeChannels: 0,
    totalNotifications: 0,
    criticalNotifications: 0,
    urgentMessages: 0,
    todayMessages: 0
  };
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        totalMessages: 156,
        unreadMessages: 12,
        totalChannels: 8,
        activeChannels: 6,
        totalNotifications: 24,
        criticalNotifications: 2,
        urgentMessages: 3,
        todayMessages: 18
      };
      
      setIsLoading(false);
    };
    
    loadStats();
  }, []);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Radio}
        title="Communication Command Center"
        description="Centro Unificado de Comunicação, Canais e Notificações"
        gradient="purple"
        badges={[
          { icon: MessageSquare, label: "Mensagens" },
          { icon: Hash, label: "Canais" },
          { icon: Bell, label: "Notificações" },
          { icon: Sparkles, label: "IA Integrada" }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Mensagens</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <span className="hidden sm:inline">Canais</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSetActiveTab}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                          <p className="text-sm text-muted-foreground">Mensagens Não Lidas</p>
                        </div>
                        <Inbox className="h-8 w-8 text-primary opacity-50" />
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        de {stats.totalMessages} mensagens totais
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSetActiveTab}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{stats.activeChannels}</p>
                          <p className="text-sm text-muted-foreground">Canais Ativos</p>
                        </div>
                        <Hash className="h-8 w-8 text-green-500 opacity-50" />
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        de {stats.totalChannels} canais totais
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSetActiveTab}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{stats.totalNotifications}</p>
                          <p className="text-sm text-muted-foreground">Notificações</p>
                        </div>
                        <Bell className="h-8 w-8 text-orange-500 opacity-50" />
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        {stats.criticalNotifications} críticas
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">{stats.urgentMessages}</p>
                          <p className="text-sm text-muted-foreground">Urgentes</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        Mensagens prioritárias
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesse as principais funcionalidades de comunicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={handleSetActiveTab}
                  >
                    <Send className="h-6 w-6 text-primary" />
                    <span className="font-medium">Nova Mensagem</span>
                    <span className="text-xs text-muted-foreground">Enviar comunicação</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={handleSetActiveTab}
                  >
                    <Hash className="h-6 w-6 text-green-500" />
                    <span className="font-medium">Gerenciar Canais</span>
                    <span className="text-xs text-muted-foreground">Criar e editar canais</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={handleSetActiveTab}
                  >
                    <Bell className="h-6 w-6 text-orange-500" />
                    <span className="font-medium">Ver Notificações</span>
                    <span className="text-xs text-muted-foreground">Alertas e avisos</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => handletoast}
                  >
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    <span className="font-medium">Assistente IA</span>
                    <span className="text-xs text-muted-foreground">Ajuda inteligente</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>
                    Últimas interações no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Nova mensagem no canal Operações</p>
                        <p className="text-xs text-muted-foreground">há 5 minutos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-orange-500/10 rounded">
                        <Bell className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Alerta de certificação expirando</p>
                        <p className="text-xs text-muted-foreground">há 15 minutos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-green-500/10 rounded">
                        <Hash className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Canal "Emergência" atualizado</p>
                        <p className="text-xs text-muted-foreground">há 30 minutos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="p-2 bg-purple-500/10 rounded">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">IA gerou resumo de comunicações</p>
                        <p className="text-xs text-muted-foreground">há 1 hora</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo do Sistema
                  </CardTitle>
                  <CardDescription>
                    Status consolidado de comunicações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Canais Online</span>
                      </div>
                      <Badge variant="secondary">{stats.activeChannels}/{stats.totalChannels}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Mensagens Hoje</span>
                      </div>
                      <Badge variant="secondary">{stats.todayMessages}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Notificações Pendentes</span>
                      </div>
                      <Badge variant="secondary">{stats.totalNotifications}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span className="font-medium">Alertas Críticos</span>
                      </div>
                      <Badge variant="destructive">{stats.criticalNotifications}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance de Comunicação
                </CardTitle>
                <CardDescription>
                  Métricas consolidadas do centro de comunicações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{stats.totalMessages}</p>
                    <p className="text-sm text-muted-foreground">Total Mensagens</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <Hash className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{stats.totalChannels}</p>
                    <p className="text-sm text-muted-foreground">Canais Ativos</p>
                  </div>
                  <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold">{stats.totalNotifications}</p>
                    <p className="text-sm text-muted-foreground">Notificações</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-sm text-muted-foreground">Usuários Online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <CommunicationCenterProfessional />
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <ChannelManagerProfessional />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationCenterProfessional />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Comunicação
              </CardTitle>
              <CardDescription>
                Gerencie as preferências do centro de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Notificações</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Notificações por E-mail</p>
                      <p className="text-sm text-muted-foreground">Receber alertas por e-mail</p>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Notificações Push</p>
                      <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Sons de Notificação</p>
                      <p className="text-sm text-muted-foreground">Alertas sonoros</p>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Preferências</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Modo Compacto</p>
                      <p className="text-sm text-muted-foreground">Interface reduzida</p>
                    </div>
                    <Badge variant="outline">Desativado</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-arquivar</p>
                      <p className="text-sm text-muted-foreground">Arquivar após 30 dias</p>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Assistente IA</p>
                      <p className="text-sm text-muted-foreground">Sugestões inteligentes</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-500">IA Ativa</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default CommunicationCommandCenter;
