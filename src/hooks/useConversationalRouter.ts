/**
 * useConversationalRouter Hook
 * Enables natural language navigation and context-based routing
 */

import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseIntent, getSuggestedActions } from '@/components/conversational/AIIntentParser';
import type { ParsedIntent, ConversationalContext } from '@/components/conversational/types';

export function useConversationalRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [context, setContext] = useState<ConversationalContext>({
    currentModule: location.pathname,
    recentActions: [],
    userPreferences: {},
    sessionHistory: [],
  });

  const processCommand = useCallback((query: string): ParsedIntent => {
    const intent = parseIntent(query);
    
    // Update context
    setContext(prev => ({
      ...prev,
      currentModule: location.pathname,
      recentActions: [...prev.recentActions.slice(-9), query],
    }));

    // Auto-navigate if high confidence navigation intent
    if (intent.type === 'navigate' && intent.suggestedRoute && intent.confidence > 0.75) {
      navigate(intent.suggestedRoute);
    }

    return intent;
  }, [navigate, location.pathname]);

  const navigateByVoice = useCallback((transcript: string) => {
    const intent = parseIntent(transcript);
    if (intent.suggestedRoute) {
      navigate(intent.suggestedRoute);
      return true;
    }
    return false;
  }, [navigate]);

  const getSuggestions = useCallback((query: string) => {
    const intent = parseIntent(query);
    return getSuggestedActions(intent);
  }, []);

  const navigateTo = useCallback((route: string) => {
    navigate(route);
    setContext(prev => ({
      ...prev,
      currentModule: route,
      recentActions: [...prev.recentActions.slice(-9), `navigate:${route}`],
    }));
  }, [navigate]);

  return {
    currentModule: context.currentModule,
    recentActions: context.recentActions,
    processCommand,
    navigateByVoice,
    getSuggestions,
    navigateTo,
    context,
  };
}
