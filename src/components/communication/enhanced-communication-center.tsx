import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Inbox, 
  Send,
  Bell,
  BellOff,
  Search,
  Filter,
  Archive,
  Trash2,
  Star,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Hash,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { InboxManager } from './inbox-manager';
import { ChannelManager } from './channel-manager';
import { MessageComposer } from './message-composer';
import { NotificationCenter } from './notification-center';
import { SettingsPanel } from './settings-panel';
import { CommunicationAnalytics } from './communication-analytics';

interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  activeChannels: number;
  urgentMessages: number;
  todayMessages: number;
  responseRate: number;
}

export const EnhancedCommunicationCenter = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [stats, setStats] = useState<CommunicationStats>({
    totalMessages: 0,
    unreadMessages: 0,
    activeChannels: 0,
    urgentMessages: 0,
    todayMessages: 0,
    responseRate: 95
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommunicationStats();
  }, []);

  const loadCommunicationStats = async () => {
    try {
      setLoading(true);
      // Mock data - replace with real API calls
      setStats({
        totalMessages: 1247,
        unreadMessages: 23,
        activeChannels: 8,
        urgentMessages: 3,
        todayMessages: 47,
        responseRate: 95
      });
    } catch (error) {
      console.error('Error loading communication stats:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas de comunicação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'inbox': return Inbox;
      case 'channels': return Hash;
      case 'compose': return Send;
      case 'notifications': return Bell;
      case 'analytics': return Archive;
      case 'settings': return Settings;
      default: return MessageSquare;
    }
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
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Centro de Comunicação</h1>
            <p className="text-muted-foreground">
              Comunicação interna profissional e inteligente
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificações
              {stats.unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.unreadMessages}
                </Badge>
              )}
            </Button>
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Mensagem
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{stats.totalMessages.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Inbox className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Não Lidas</p>
                <p className="text-lg font-semibold">{stats.unreadMessages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Hash className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canais</p>
                <p className="text-lg font-semibold">{stats.activeChannels}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-lg font-semibold">{stats.urgentMessages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Clock className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-lg font-semibold">{stats.todayMessages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Resp.</p>
                <p className="text-lg font-semibold">{stats.responseRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Alerts */}
        {stats.urgentMessages > 0 && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    Você tem {stats.urgentMessages} mensagem(ns) urgente(s) aguardando resposta
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique na caixa de entrada para visualizar
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Ver Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Communication Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="inbox" className="gap-2">
            <Inbox className="h-4 w-4" />
            Caixa de Entrada
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Hash className="h-4 w-4" />
            Canais
          </TabsTrigger>
          <TabsTrigger value="compose" className="gap-2">
            <Send className="h-4 w-4" />
            Compor
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Archive className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <InboxManager 
            unreadCount={stats.unreadMessages}
            urgentCount={stats.urgentMessages}
            onStatsUpdate={setStats}
          />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <ChannelManager 
            activeChannels={stats.activeChannels}
            onStatsUpdate={setStats}
          />
        </TabsContent>

        <TabsContent value="compose" className="mt-6">
          <MessageComposer 
            onMessageSent={() => {
              toast({
                title: "Sucesso",
                description: "Mensagem enviada com sucesso"
              });
              loadCommunicationStats();
            }}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CommunicationAnalytics stats={stats} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};