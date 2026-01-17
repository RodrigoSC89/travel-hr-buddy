/**
 * Hook for Audit Chat Persistence (localStorage only)
 * Provides persistence for chat sessions without Supabase dependency
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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

const LOCAL_STORAGE_KEY = 'audit-chat-sessions';

export function useAuditChatPersistence(activeModule: 'peotram' | 'peodp') {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [activeModule]);

  const loadSessions = useCallback(() => {
    setIsLoading(true);
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
  }, [activeModule]);

  const saveToLocalStorage = useCallback((allSessions: ChatSession[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allSessions));
  }, []);

  const getAllSessions = useCallback((): ChatSession[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const saveSession = useCallback((session: ChatSession): ChatSession => {
    const now = new Date().toISOString();
    const updatedSession = { ...session, updatedAt: now };
    
    const allSessions = getAllSessions();
    const existingIndex = allSessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      allSessions[existingIndex] = updatedSession;
    } else {
      allSessions.unshift(updatedSession);
    }
    
    saveToLocalStorage(allSessions);
    setSessions(allSessions.filter(s => s.module === activeModule));
    
    return updatedSession;
  }, [activeModule, getAllSessions, saveToLocalStorage]);

  const createSession = useCallback((
    title: string,
    messages: ChatMessage[]
  ): ChatSession => {
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title,
      messages,
      module: activeModule,
      createdAt: now,
      updatedAt: now
    };

    const allSessions = getAllSessions();
    allSessions.unshift(newSession);
    saveToLocalStorage(allSessions);
    setSessions(allSessions.filter(s => s.module === activeModule));
    
    return newSession;
  }, [activeModule, getAllSessions, saveToLocalStorage]);

  const deleteSession = useCallback((sessionId: string) => {
    const allSessions = getAllSessions();
    const filtered = allSessions.filter(s => s.id !== sessionId);
    saveToLocalStorage(filtered);
    setSessions(filtered.filter(s => s.module === activeModule));
    toast.success('Conversa excluída');
  }, [activeModule, getAllSessions, saveToLocalStorage]);

  const updateSessionMessages = useCallback((
    sessionId: string,
    messages: ChatMessage[]
  ) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      saveSession({ ...session, messages });
    }
  }, [sessions, saveSession]);

  return {
    sessions,
    isLoading,
    createSession,
    saveSession,
    deleteSession,
    updateSessionMessages,
    refreshSessions: loadSessions
  };
}
