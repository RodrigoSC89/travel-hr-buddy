import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatInterface } from './chat-interface';
import { 
  MessageSquare, 
  Users, 
  Bell, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Globe,
  Shield
} from 'lucide-react';

export const CommunicationModule = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const communicationStats = [
    {
      icon: MessageSquare,
      title: "Mensagens Ativas",
      value: "24",
      change: "+12%",
      trend: "up",
      description: "Conversas em andamento",
      color: "blue"
    },
    {
      icon: Users,
      title: "Usuários Online",
      value: "18",
      change: "+3",
      trend: "up", 
      description: "Conectados agora",
      color: "green"
    },
    {
      icon: Clock,
      title: "Tempo de Resposta",
      value: "2.3min",
      change: "-15%",
      trend: "up",
      description: "Média de resposta",
      color: "purple"
    },
    {
      icon: CheckCircle,
      title: "Taxa de Resolução",
      value: "94%",
      change: "+5%",
      trend: "up",
      description: "Solicitações resolvidas",
      color: "orange"
    }
  ];

  const quickActions = [
    {
      icon: MessageSquare,
      label: "Nova Conversa",
      description: "Iniciar chat direto",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      label: "Criar Grupo",
      description: "Chat em grupo",
      color: "bg-green-500"
    },
    {
      icon: Bell,
      label: "Notificações",
      description: "Centro de alertas",
      color: "bg-orange-500"
    }
  ];

  const recentActivities = [
    {
      type: "message",
      user: "Maria Silva",
      action: "enviou uma mensagem",
      content: "Preciso do relatório até hoje...",
      time: "2 min atrás",
      icon: MessageSquare,
      priority: "high"
    },
    {
      type: "group",
      user: "João Santos",
      action: "criou um grupo",
      content: "Equipe de Desenvolvimento",
      time: "15 min atrás",
      icon: Users,
      priority: "medium"
    },
    {
      type: "call",
      user: "Ana Costa",
      action: "iniciou uma chamada",
      content: "Reunião de planejamento",
      time: "1 hora atrás",
      icon: CheckCircle,
      priority: "medium"
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-8 text-azure-50">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Centro de Comunicação Inteligente
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-3xl">
            Sistema avançado de comunicação em tempo real com IA integrada para otimizar 
            a colaboração e produtividade da equipe.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Zap className="h-5 w-5" />
              <span>Tempo Real</span>
            </div>
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Shield className="h-5 w-5" />
              <span>Segurança Avançada</span>
            </div>
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Globe className="h-5 w-5" />
              <span>Multi-plataforma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communicationStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "from-blue-500/20 via-blue-400/10 to-cyan-500/20 border-blue-200/50 text-blue-600",
            green: "from-green-500/20 via-green-400/10 to-emerald-500/20 border-green-200/50 text-green-600",
            purple: "from-purple-500/20 via-purple-400/10 to-violet-500/20 border-purple-200/50 text-purple-600",
            orange: "from-orange-500/20 via-orange-400/10 to-red-500/20 border-orange-200/50 text-orange-600"
          };

          return (
            <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[stat.color]} hover:shadow-lg group cursor-pointer border backdrop-blur-sm transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${colorClasses[stat.color].split(' ')[5]}`} />
                      <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} group-hover:scale-110 transition-transform`} />
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl bg-opacity-10 backdrop-blur-sm group-hover:scale-105 transition-all duration-300`}>
                    <Icon className={`w-8 h-8 ${colorClasses[stat.color].split(' ')[5]}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ações Rápidas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Acesso direto às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 hover:scale-105 transition-all duration-200"
                    onClick={() => setActiveTab('chat')}
                  >
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <Icon className="h-4 w-4 text-azure-50" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas interações e eventos do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                const priorityColors = {
                  high: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
                  medium: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10",
                  low: "border-l-green-500 bg-green-50 dark:bg-green-900/10"
                };

                return (
                  <div
                    key={index}
                    className={`p-4 border-l-4 rounded-lg ${priorityColors[activity.priority]} hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-azure-100 dark:bg-azure-800">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{activity.user}</span>
                          <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {activity.action}
                        </p>
                        <p className="text-sm font-medium">{activity.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos Avançados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Recursos Avançados de Comunicação
          </CardTitle>
          <CardDescription>
            Funcionalidades inovadoras para comunicação empresarial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🤖 IA Conversacional</h4>
              <p className="text-sm text-blue-600">
                Assistente inteligente para tradução, resumos e análise de sentimentos em tempo real
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🔒 Criptografia Ponta a Ponta</h4>
              <p className="text-sm text-green-600">
                Segurança máxima com criptografia avançada e verificação de identidade
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">📊 Analytics de Comunicação</h4>
              <p className="text-sm text-purple-600">
                Métricas detalhadas de engajamento, produtividade e eficiência da equipe
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">🎥 Conferências HD</h4>
              <p className="text-sm text-orange-600">
                Videochamadas de alta qualidade com compartilhamento de tela e gravação
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
              <h4 className="font-semibold text-teal-800 mb-2">📋 Integração com Tarefas</h4>
              <p className="text-sm text-teal-600">
                Criação automática de tarefas e lembretes a partir das conversas
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-indigo-800 mb-2">🌐 Tradução Instantânea</h4>
              <p className="text-sm text-indigo-600">
                Comunicação global com tradução automática em mais de 100 idiomas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-3">
            <MessageSquare className="h-10 w-10 text-blue-600" />
            CENTRO DE COMUNICAÇÃO
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Plataforma Inteligente de Comunicação Empresarial em Tempo Real
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
              💬 Chat Instantâneo
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              🤖 IA Integrada
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-300">
              🔒 Segurança Total
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="chat">
          <ChatInterface />
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Centro de Notificações</CardTitle>
              <CardDescription>
                Gerencie alertas e notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O centro de notificações será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Comunicação</CardTitle>
              <CardDescription>
                Personalize suas preferências de comunicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Configurações em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  As configurações avançadas serão implementadas em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};