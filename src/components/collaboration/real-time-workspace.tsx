import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Share2, 
  Video, 
  Mic, 
  MicOff,
  Monitor,
  MoreHorizontal,
  UserPlus,
  Settings,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'online' | 'away' | 'busy' | 'offline';
  cursor?: {
    x: number;
    y: number;
  };
}

interface WorkspaceMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

interface RealTimeWorkspaceProps {
  workspaceId: string;
  title?: string;
  onInviteUser?: () => void;
}

export const RealTimeWorkspace: React.FC<RealTimeWorkspaceProps> = ({
  workspaceId,
  title = "Workspace Colaborativo",
  onInviteUser
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const channelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initialize current user
    const userParticipant: Participant = {
      id: user.id,
      name: user.email?.split('@')[0] || 'Usuário',
      role: 'member',
      status: 'online'
    };
    setCurrentUser(userParticipant);

    // Set up Supabase channel for real-time collaboration
    const channel = supabase.channel(`workspace-${workspaceId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence (who's online)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const participantsList: Participant[] = [];
        
        Object.keys(state).forEach((userId) => {
          const presences = state[userId];
          if (presences.length > 0) {
            const presence = presences[0] as any;
            participantsList.push({
              id: userId,
              name: presence.name || 'Usuário',
              avatar: presence.avatar,
              role: presence.role || 'member',
              status: 'online',
              cursor: presence.cursor
            });
          }
        });
        
        setParticipants(participantsList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        toast({
          title: "Novo participante",
          description: `${newPresences[0]?.name || 'Usuário'} entrou no workspace`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        toast({
          title: "Participante saiu",
          description: `${leftPresences[0]?.name || 'Usuário'} saiu do workspace`,
        });
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        const message: WorkspaceMessage = {
          id: payload.id,
          userId: payload.userId,
          userName: payload.userName,
          content: payload.content,
          timestamp: new Date(payload.timestamp),
          type: payload.type || 'text'
        };
        setMessages(prev => [...prev, message]);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setParticipants(prev => prev.map(p => 
          p.id === payload.userId 
            ? { ...p, cursor: payload.cursor }
            : p
        ));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence when connected
          await channel.track({
            name: userParticipant.name,
            avatar: userParticipant.avatar,
            role: userParticipant.role,
            status: 'online'
          });
          setIsConnected(true);
          
          // Send system message
          const systemMessage: WorkspaceMessage = {
            id: `system-${Date.now()}`,
            userId: 'system',
            userName: 'Sistema',
            content: `${userParticipant.name} entrou no workspace`,
            timestamp: new Date(),
            type: 'system'
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      });

    channelRef.current = channel;

    // Track mouse movement for cursor sharing
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      
      // Throttle cursor updates
      if (channelRef.current && Date.now() % 100 === 0) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'cursor',
          payload: {
            userId: user.id,
            cursor: newPosition
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, workspaceId, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !channelRef.current || !currentUser) return;

    const message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });

    setNewMessage('');
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({
      title: isAudioEnabled ? "Áudio desabilitado" : "Áudio habilitado",
      description: `Microfone ${isAudioEnabled ? 'desligado' : 'ligado'}`,
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? "Vídeo desabilitado" : "Vídeo habilitado",
      description: `Câmera ${isVideoEnabled ? 'desligada' : 'ligada'}`,
    });
  };

  const getStatusColor = (status: Participant['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const renderMessage = (message: WorkspaceMessage) => {
    const isCurrentUser = message.userId === currentUser?.id;
    const isSystem = message.type === 'system';

    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isCurrentUser && !isSystem ? 'flex-row-reverse' : ''}`}>
        {!isSystem && (
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {message.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`flex-1 ${isCurrentUser && !isSystem ? 'text-right' : ''}`}>
          {!isSystem && (
            <p className="text-xs text-muted-foreground mb-1">
              {message.userName}
            </p>
          )}
          
          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
            isSystem 
              ? 'bg-muted text-muted-foreground text-center w-full'
              : isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent text-accent-foreground'
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Main Workspace Area */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {title}
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudio}
                  className={isAudioEnabled ? 'bg-green-100' : ''}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVideo}
                  className={isVideoEnabled ? 'bg-green-100' : ''}
                >
                  <Video className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Monitor className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 relative">
            {/* Collaborative Canvas Area */}
            <div className="h-full bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Área de Trabalho Colaborativo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe documentos, faça anotações e colabore em tempo real
                </p>
              </div>

              {/* Render other participants' cursors */}
              {participants.map(participant => 
                participant.id !== currentUser?.id && participant.cursor && (
                  <div
                    key={participant.id}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: participant.cursor.x,
                      top: participant.cursor.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      {participant.name}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Participants */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participantes ({participants.length})
              </span>
              <Button variant="outline" size="sm" onClick={onInviteUser}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(participant.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {participant.name}
                      {participant.id === currentUser?.id && ' (Você)'}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="flex-1 flex flex-col h-[400px]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                size="icon"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};