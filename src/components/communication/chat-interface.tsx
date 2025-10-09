import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  Users,
  MessageSquare,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
  is_read?: boolean;
}

interface Conversation {
  id: string;
  title?: string;
  type: 'direct' | 'group';
  last_message_at: string;
  participants: Array<{
    user_id: string;
    user: {
      full_name: string;
      email: string;
    };
  }>;
  last_message?: Message;
  unread_count?: number;
}

export const ChatInterface = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        await loadConversations();
        await loadAllUsers();
      }
    };

    getCurrentUser();
  }, [loadConversations, loadAllUsers]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      setupMessageRealtime(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAllUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', currentUser?.id);

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }, [currentUser?.id]);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          type,
          last_message_at,
          conversation_participants!inner (
            user_id,
            profiles!conversation_participants_user_id_fkey (
              full_name,
              email
            )
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv: any) => {
          // Carregar última mensagem
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              sender_id,
              created_at,
              profiles!messages_sender_id_fkey (
                full_name,
                email
              )
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Calcular mensagens não lidas
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .neq('sender_id', currentUser?.id)
            .not('id', 'in', `(
              SELECT message_id 
              FROM message_read_status 
              WHERE user_id = '${currentUser?.id}'
            )`);

          return {
            ...conv,
            participants: conv.conversation_participants.map((p: any) => ({
              user_id: p.user_id,
              user: p.profiles
            })),
            last_message: lastMessage ? {
              ...lastMessage,
              sender: lastMessage.profiles
            } : undefined,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, toast]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          profiles!messages_sender_id_fkey (
            full_name,
            email
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithSender = (data || []).map((msg: any) => ({
        ...msg,
        sender: msg.profiles
      }));

      setMessages(messagesWithSender);

      // Marcar mensagens como lidas
      await markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        await loadConversations();
        await loadAllUsers();
      }
    };

    getCurrentUser();
  }, [loadConversations, loadAllUsers]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      setupMessageRealtime(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      // Buscar mensagens não lidas
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUser?.id)
        .not('id', 'in', `(
          SELECT message_id 
          FROM message_read_status 
          WHERE user_id = '${currentUser?.id}'
        )`);

      if (unreadMessages && unreadMessages.length > 0) {
        const readStatuses = unreadMessages.map(msg => ({
          message_id: msg.id,
          user_id: currentUser?.id
        }));

        await supabase
          .from('message_read_status')
          .insert(readStatuses);
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  const setupMessageRealtime = (conversationId: string) => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Carregar dados completos da mensagem
          const { data: newMessage } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              sender_id,
              created_at,
              profiles!messages_sender_id_fkey (
                full_name,
                email
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMessage) {
            const messageWithSender = {
              id: newMessage.id,
              content: newMessage.content,
              sender_id: newMessage.sender_id,
              created_at: newMessage.created_at,
              sender: {
                full_name: (newMessage as any).profiles?.full_name || '',
                email: (newMessage as any).profiles?.email || ''
              }
            };
            setMessages(prev => [...prev, messageWithSender]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: currentUser?.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const createNewConversation = async (userId: string) => {
    try {
      // Verificar se já existe conversa direta
      const { data: existingConv } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            type
          )
        `)
        .eq('user_id', currentUser?.id)
        .eq('conversations.type', 'direct');

      if (existingConv) {
        for (const conv of existingConv) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .neq('user_id', currentUser?.id)
            .single();

          if (otherParticipant?.user_id === userId) {
            setSelectedConversation(conv.conversation_id);
            setShowNewChat(false);
            return;
          }
        }
      }

      // Criar nova conversa
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: currentUser?.id },
          { conversation_id: newConv.id, user_id: userId }
        ]);

      if (participantsError) throw participantsError;

      setSelectedConversation(newConv.id);
      setShowNewChat(false);
      await loadConversations();

      toast({
        title: "Sucesso",
        description: "Nova conversa criada",
      });
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa",
        variant: "destructive",
      });
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    if (conversation.type === 'direct') {
      const otherUser = conversation.participants.find(p => p.user_id !== currentUser?.id);
      return otherUser?.user.full_name || otherUser?.user.email || 'Usuário';
    }
    
    return `Grupo (${conversation.participants.length} membros)`;
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationTitle(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Mensagens</h2>
            <Button
              size="sm"
              onClick={() => setShowNewChat(!showNewChat)}
              className="rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Nova Conversa */}
        {showNewChat && (
          <div className="p-4 border-b bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Iniciar nova conversa</h3>
            <ScrollArea className="h-32">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                  onClick={() => createNewConversation(user.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.full_name || user.email}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Lista de Conversas */}
        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation === conversation.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {conversation.type === 'group' ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      getConversationTitle(conversation).charAt(0)
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {getConversationTitle(conversation)}
                    </p>
                    <div className="flex items-center gap-1">
                      {conversation.unread_count > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conversation.last_message.sender_id === currentUser?.id ? 'Você: ' : ''}
                      {conversation.last_message.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {conversations
                      .find(c => c.id === selectedConversation)
                      ?.type === 'group' ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      getConversationTitle(
                        conversations.find(c => c.id === selectedConversation)!
                      ).charAt(0)
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {getConversationTitle(
                      conversations.find(c => c.id === selectedConversation)!
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {conversations
                      .find(c => c.id === selectedConversation)
                      ?.type === 'group'
                      ? `${conversations.find(c => c.id === selectedConversation)?.participants.length} membros`
                      : 'Online'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === currentUser?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.sender_id !== currentUser?.id && (
                        <p className="text-xs font-medium mb-1">
                          {message.sender?.full_name || message.sender?.email}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.sender_id === currentUser?.id && (
                          <CheckCheck className="h-3 w-3 opacity-70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista ou inicie uma nova
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};