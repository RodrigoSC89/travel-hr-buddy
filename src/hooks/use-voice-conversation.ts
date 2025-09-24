import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
  actionData?: any;
}

interface VoiceSettings {
  voice_id: string;
  language: string;
  auto_listen: boolean;
  volume: number;
  microphone_sensitivity: number;
  tone: string;
  response_length: string;
  expertise: string[];
  custom_instructions?: string;
  context_awareness: boolean;
  proactive_help: boolean;
}

export const useVoiceConversation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [settings, setSettings] = useState<VoiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configurações do usuário
  const loadUserSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voice_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading voice settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Criar configurações padrão se não existirem
        const defaultSettings = {
          user_id: user.id,
          voice_id: 'alloy',
          language: 'pt-BR',
          auto_listen: true,
          volume: 0.8,
          microphone_sensitivity: 0.5,
          tone: 'friendly',
          response_length: 'balanced',
          expertise: ['Recursos Humanos', 'Viagens Corporativas'],
          context_awareness: true,
          proactive_help: true
        };

        const { data: newSettings, error: createError } = await supabase
          .from('voice_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default settings:', createError);
        } else {
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error in loadUserSettings:', error);
    }
  }, [user]);

  // Criar nova conversa
  const startConversation = useCallback(async () => {
    if (!user) return null;

    try {
      setIsLoading(true);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('voice_conversations')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          title: `Conversa ${new Date().toLocaleString('pt-BR')}`,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a conversa.",
          variant: "destructive",
        });
        return null;
      }

      setConversationId(data.id);
      setMessages([]);
      return data.id;
    } catch (error) {
      console.error('Error in startConversation:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Finalizar conversa
  const endConversation = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      const totalDuration = messages.reduce((acc, msg) => acc + (msg.actionData?.duration || 0), 0);

      await supabase
        .from('voice_conversations')
        .update({
          ended_at: new Date().toISOString(),
          total_messages: messages.length,
          total_duration: Math.floor(totalDuration / 1000),
          status: 'completed'
        })
        .eq('id', conversationId);

      setConversationId(null);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  }, [conversationId, messages, user]);

  // Salvar mensagem
  const saveMessage = useCallback(async (message: Omit<VoiceMessage, 'id'>) => {
    if (!conversationId || !user) return;

    try {
      const { data, error } = await supabase
        .from('voice_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          type: message.type,
          content: message.content,
          action_type: message.action || null,
          action_data: message.actionData || {},
          duration: message.actionData?.duration || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        return;
      }

      // Adicionar à lista local de mensagens
      const newMessage: VoiceMessage = {
        id: data.id,
        type: message.type,
        content: message.content,
        timestamp: new Date(data.created_at),
        action: message.action,
        actionData: message.actionData
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error in saveMessage:', error);
    }
  }, [conversationId, user]);

  // Registrar comando de voz
  const logVoiceCommand = useCallback(async (
    commandText: string,
    intent: string,
    moduleTarget?: string,
    actionExecuted?: string,
    success: boolean = true,
    responseTime?: number
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('voice_commands')
        .insert({
          user_id: user.id,
          command_text: commandText,
          intent,
          module_target: moduleTarget,
          action_executed: actionExecuted,
          success,
          response_time: responseTime
        });
    } catch (error) {
      console.error('Error logging voice command:', error);
    }
  }, [user]);

  // Salvar configurações
  const saveSettings = useCallback(async (newSettings: Partial<VoiceSettings>) => {
    if (!user || !settings) return;

    try {
      const { data, error } = await supabase
        .from('voice_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error in saveSettings:', error);
    }
  }, [user, settings, toast]);

  // Carregar histórico da conversa
  const loadConversationHistory = useCallback(async (convId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voice_messages')
        .select('*')
        .eq('conversation_id', convId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      const loadedMessages: VoiceMessage[] = data.map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        action: msg.action_type,
        actionData: msg.action_data
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error in loadConversationHistory:', error);
    }
  }, [user]);

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  // Exportar conversa
  const exportConversation = useCallback(() => {
    if (messages.length === 0) return;

    const conversationData = {
      timestamp: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        action: msg.action
      }))
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-voz-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversa exportada",
      description: "O arquivo foi baixado com sucesso.",
    });
  }, [messages, toast]);

  // Carregar configurações quando o usuário fizer login
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  return {
    conversationId,
    messages,
    settings,
    isLoading,
    startConversation,
    endConversation,
    saveMessage,
    logVoiceCommand,
    saveSettings,
    loadConversationHistory,
    clearHistory,
    exportConversation
  };
};