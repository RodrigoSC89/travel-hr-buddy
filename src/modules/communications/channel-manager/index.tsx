import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Radio, Satellite, Send, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChannelManager = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState([
    {
      id: '1',
      name: 'VHF Canal 16',
      type: 'radio',
      status: 'online',
      latency: 12,
      uptime: 99.8,
      users: 45
    },
    {
      id: '2',
      name: 'Satélite Inmarsat',
      type: 'satellite',
      status: 'online',
      latency: 450,
      uptime: 98.5,
      users: 12
    },
    {
      id: '3',
      name: 'Canal Emergência',
      type: 'radio',
      status: 'standby',
      latency: 8,
      uptime: 100,
      users: 0
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([
    {
      id: '1',
      channel_id: '1',
      user: 'Operador A',
      message: 'Teste de comunicação confirmado',
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      channel_id: '1',
      user: 'Ponte',
      message: 'Recebido, status nominal',
      timestamp: new Date(Date.now() - 180000).toISOString()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      channel_id: selectedChannel.id,
      user: 'Você',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    toast({
      title: 'Mensagem enviada',
      description: `Via ${selectedChannel.name}`
    });
  };

  const handleTestFallback = () => {
    toast({
      title: 'Testando fallback',
      description: 'Simulando falha e alternância automática',
    });

    setTimeout(() => {
      toast({
        title: 'Fallback ativado',
        description: 'Canal alternativo: Satélite Inmarsat',
      });
    }, 2000);
  };

  const channelMessages = messages.filter(m => m.channel_id === selectedChannel.id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500',
      standby: 'bg-amber-500',
      offline: 'bg-red-500'
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Channel Manager</h1>
            <p className="text-muted-foreground">Gerenciamento de canais de comunicação</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleTestFallback}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Testar Fallback
        </Button>
      </div>

      {/* Estatísticas globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Canais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {channels.filter(c => c.status === 'online').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Usuários Conectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {channels.reduce((sum, c) => sum + c.users, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Uptime Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(channels.reduce((sum, c) => sum + c.uptime, 0) / channels.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mensagens (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de canais */}
        <Card>
          <CardHeader>
            <CardTitle>Canais Disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedChannel.id === channel.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedChannel(channel)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {channel.type === 'radio' ? (
                      <Radio className="h-5 w-5" />
                    ) : (
                      <Satellite className="h-5 w-5" />
                    )}
                    <span className="font-semibold">{channel.name}</span>
                  </div>
                  <Badge className={getStatusColor(channel.status)}>
                    {channel.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Latência: {channel.latency}ms</div>
                  <div>Uptime: {channel.uptime}%</div>
                  <div>Usuários: {channel.users}</div>
                  <div>Tipo: {channel.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Área de mensagens */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedChannel.type === 'radio' ? (
                <Radio className="h-5 w-5" />
              ) : (
                <Satellite className="h-5 w-5" />
              )}
              {selectedChannel.name}
              <Badge className={getStatusColor(selectedChannel.status)}>
                {selectedChannel.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedChannel.latency}ms</div>
                <div className="text-xs text-muted-foreground">Latência</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedChannel.uptime}%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedChannel.users}</div>
                <div className="text-xs text-muted-foreground">Usuários</div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-3">
                {channelMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma mensagem neste canal
                  </div>
                ) : (
                  channelMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={selectedChannel.status !== 'online'}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={selectedChannel.status !== 'online'}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelManager;
