/**
 * Hook for Audit Chat Persistence
 * Uses Supabase for cross-device sync with localStorage fallback
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  module?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  module: 'peotram' | 'peodp';
  createdAt: string;
  updatedAt: string;
}

interface SupabaseRow {
  id: string;
  title: string;
  module: string;
  messages: unknown;
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = 'audit-chat-sessions';

export function useAuditChatPersistence(activeModule: 'peotram' | 'peodp') {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load sessions on mount or when module changes
  useEffect(() => {
    loadSessions();
  }, [activeModule, user?.id]);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    
    // Try Supabase first if user is authenticated
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('audit_chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('module', activeModule)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const supabaseSessions: ChatSession[] = data.map(row => ({
            id: row.id,
            title: row.title,
            messages: (row.messages as unknown as ChatMessage[]) || [],
            module: row.module as 'peotram' | 'peodp',
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          setSessions(supabaseSessions);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Supabase load failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        setSessions(parsed.filter(s => s.module === activeModule));
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
    }
    setIsLoading(false);
  }, [activeModule, user?.id]);

  const saveToLocalStorage = useCallback((allSessions: ChatSession[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allSessions));
  }, []);

  const getAllLocalSessions = useCallback((): ChatSession[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const saveSession = useCallback(async (session: ChatSession): Promise<ChatSession> => {
    const now = new Date().toISOString();
    const updatedSession = { ...session, updatedAt: now };
    
    // Try Supabase first
    if (user?.id) {
      try {
        const upsertData = {
          id: session.id,
          user_id: user.id,
          title: session.title,
          module: session.module,
          messages: JSON.parse(JSON.stringify(session.messages)),
          updated_at: now
        };
        
        const { error } = await supabase
          .from('audit_chat_sessions')
          .upsert(upsertData, { onConflict: 'id' });

        if (!error) {
          setSessions(prev => {
            const existingIndex = prev.findIndex(s => s.id === session.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = updatedSession;
              return updated;
            }
            return [updatedSession, ...prev];
          });
          return updatedSession;
        }
      } catch (error) {
        console.warn('Supabase save failed, using localStorage:', error);
      }
    }

    // Fallback to localStorage
    const allSessions = getAllLocalSessions();
    const existingIndex = allSessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = updatedSession;
    } else {
      allSessions.unshift(updatedSession);
    }
    
    saveToLocalStorage(allSessions);
    setSessions(allSessions.filter(s => s.module === activeModule));
    
    return updatedSession;
  }, [activeModule, user?.id, getAllLocalSessions, saveToLocalStorage]);

  const createSession = useCallback((
    title: string,
    messages: ChatMessage[]
  ): ChatSession => {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      messages,
      module: activeModule,
      createdAt: now,
      updatedAt: now
    };

    // Save asynchronously
    saveSession(newSession);
    
    return newSession;
  }, [activeModule, saveSession]);

  const deleteSession = useCallback(async (sessionId: string) => {
    // Try Supabase first
    if (user?.id) {
      try {
        const { error } = await supabase
          .from('audit_chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', user.id);

        if (!error) {
          setSessions(prev => prev.filter(s => s.id !== sessionId));
          toast.success('Conversa excluída');
          return;
        }
      } catch (error) {
        console.warn('Supabase delete failed, using localStorage:', error);
      }
    }

    // Fallback to localStorage
    const allSessions = getAllLocalSessions();
    const filtered = allSessions.filter(s => s.id !== sessionId);
    saveToLocalStorage(filtered);
    setSessions(filtered.filter(s => s.module === activeModule));
    toast.success('Conversa excluída');
  }, [activeModule, user?.id, getAllLocalSessions, saveToLocalStorage]);

  const updateSessionMessages = useCallback((
    sessionId: string,
    messages: ChatMessage[]
  ) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      saveSession({ ...session, messages });
    }
  }, [sessions, saveSession]);

  // Migrate localStorage to Supabase when user logs in
  const migrateToSupabase = useCallback(async () => {
    if (!user?.id) return;

    const localSessions = getAllLocalSessions();
    if (localSessions.length === 0) return;

    try {
      for (const session of localSessions) {
        const upsertData = {
          id: session.id,
          user_id: user.id,
          title: session.title,
          module: session.module,
          messages: JSON.parse(JSON.stringify(session.messages)),
          created_at: session.createdAt,
          updated_at: session.updatedAt
        };
        
        await supabase
          .from('audit_chat_sessions')
          .upsert(upsertData, { onConflict: 'id' });
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success(`${localSessions.length} conversas sincronizadas com a nuvem`);
      loadSessions();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }, [user?.id, getAllLocalSessions, loadSessions]);

  return {
    sessions,
    isLoading,
    createSession,
    saveSession,
    deleteSession,
    updateSessionMessages,
    refreshSessions: loadSessions,
    migrateToSupabase
  };
}
