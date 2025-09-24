import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  MessageCircle, 
  Video, 
  Share2, 
  Bell,
  Activity,
  Zap,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RealTimeCollaboration = () => {
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, name: 'Ana Silva', avatar: '', status: 'online', activity: 'Editando relatório financeiro' },
    { id: 2, name: 'Carlos Santos', avatar: '', status: 'online', activity: 'Analisando dados de vendas' },
    { id: 3, name: 'Maria Costa', avatar: '', status: 'away', activity: 'Em reunião' },
    { id: 4, name: 'João Pedro', avatar: '', status: 'online', activity: 'Criando campanha de marketing' }
  ]);
  
  const [realtimeMessages, setRealtimeMessages] = useState([
    { id: 1, user: 'Ana Silva', message: 'Relatório Q4 atualizado!', time: '10:32', type: 'update' },
    { id: 2, user: 'Sistema', message: 'Novo contrato aprovado - $50k', time: '10:28', type: 'alert' },
    { id: 3, user: 'Carlos Santos', message: 'Meta de vendas atingida! 🎉', time: '10:25', type: 'achievement' }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'Você',
        message: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'message'
      };
      setRealtimeMessages(prev => [message, ...prev]);
      setNewMessage('');
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi compartilhada com a equipe."
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'update': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'alert': return <Bell className="w-4 h-4 text-orange-500" />;
      case 'achievement': return <Zap className="w-4 h-4 text-green-500" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usuários Ativos */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Colaboração em Tempo Real
          </CardTitle>
          <CardDescription>
            Veja quem está online e trabalhando no sistema agora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.activity}</p>
                </div>
                <Badge variant={user.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Video className="w-4 h-4 mr-2" />
              Reunião
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed de Atividades */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Feed de Atividades
          </CardTitle>
          <CardDescription>
            Atualizações e notificações em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Campo de nova mensagem */}
            <div className="flex gap-2">
              <Input
                placeholder="Compartilhe uma atualização..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator />
            
            {/* Lista de mensagens */}
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {realtimeMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                    {getMessageIcon(msg.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};