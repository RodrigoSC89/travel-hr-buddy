import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Send, 
  Plus,
  Circle,
  Activity,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  channel_type: string | null;
  created_at: string | null;
}

interface Message {
  id: string;
  content: string;
  user_id: string | null;
  message_type: string | null;
  created_at: string | null;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  };
}

interface Presence {
  user_id: string | null;
  status: string | null;
  current_activity?: string | null;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  };
}

const RealTimeWorkspace: React.FC = () => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Buscar canais da organização
  useEffect(() => {
    loadChannels();
  }, []);

  // Configurar Realtime quando selecionar canal
  useEffect(() => {
    if (!selectedChannel) return;

    loadMessages(selectedChannel.id);
    loadPresence(selectedChannel.id);

    // Subscribe to realtime updates
    const messagesChannel = supabase
      .channel(`workspace-messages:${selectedChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        (payload) => {
          logger.info('New message received', { payload });
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel(`workspace-presence:${selectedChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_presence',
          filter: `channel_id=eq.${selectedChannel.id}`
        },
        () => {
          loadPresence(selectedChannel.id);
        }
      )
      .subscribe();

    // Atualizar nossa presença
    updatePresence(selectedChannel.id, 'online', 'Visualizando workspace');

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
      updatePresence(selectedChannel.id, 'offline');
    };
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
      if (data && data.length > 0) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      logger.error('Error loading channels', { error });
      toast({
        title: "Erro ao carregar canais",
        description: "Não foi possível carregar os canais do workspace.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      logger.error('Error loading messages', { error });
    }
  };

  const loadPresence = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_presence')
        .select('*')
        .eq('channel_id', channelId)
        .in('status', ['online']);

      if (error) throw error;
      setPresence((data || []) as Presence[]);
    } catch (error) {
      logger.error('Error loading presence', { error });
    }
  };

  const updatePresence = async (channelId: string, status: string, activity?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('workspace_presence')
        .upsert({
          channel_id: channelId,
          user_id: user.id,
          status,
          current_activity: activity,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      logger.error('Error updating presence', { error });
    }
  };

  const sendMessage = async () => {
    if (!selectedChannel || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workspace_messages')
        .insert({
          channel_id: selectedChannel.id,
          user_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      
      setNewMessage("");
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error) {
      logger.error('Error sending message', { error });
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Workspace em Tempo Real</h1>
        <p className="text-muted-foreground">
          Colabore em tempo real com sua equipe
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Sidebar - Canais */}
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Canais</CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {channel.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-6 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedChannel?.name || "Selecione um canal"}</CardTitle>
                <CardDescription>{selectedChannel?.description}</CardDescription>
              </div>
              <Badge variant="secondary">
                <Activity className="mr-1 h-3 w-3" />
                {presence.length} online
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.profiles?.full_name?.[0] || message.profiles?.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          Usuário
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isSending}
              />
              <Button onClick={sendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Presença */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários Online ({presence.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {presence.map((p) => (
                  <div key={p.user_id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Usuário Online</p>
                      {p.current_activity && (
                        <p className="text-xs text-muted-foreground truncate">
                          {p.current_activity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeWorkspace;
