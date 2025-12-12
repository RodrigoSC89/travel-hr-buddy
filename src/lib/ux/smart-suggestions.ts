/**
 * Smart Suggestions System - PATCH 836
 * AI-powered contextual suggestions and recommendations
 */

import { useState, useEffect, useCallback, useMemo } from "react";

interface Suggestion {
  id: string;
  type: "action" | "shortcut" | "feature" | "tip" | "warning";
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  icon?: string;
  priority: number;
  context?: string[];
  dismissable?: boolean;
}

interface UserContext {
  currentRoute: string;
  recentActions: string[];
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: number;
  isNewUser: boolean;
  completedTutorials: string[];
  userRole: string;
}

class SmartSuggestionsEngine {
  private suggestions: Suggestion[] = [];
  private dismissedIds = new Set<string>();
  private storageKey = "nautilus_dismissed_suggestions";
  
  constructor() {
    this.loadDismissed();
  }
  
  private loadDismissed(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.dismissedIds = new Set(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }
  
  private saveDismissed(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.dismissedIds]));
    } catch {
      // Ignore
    }
  }
  
  /**
   * Get time of day
   */
  private getTimeOfDay(): UserContext["timeOfDay"] {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
  
  /**
   * Generate suggestions based on context
   */
  generateSuggestions(context: Partial<UserContext>): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const timeOfDay = this.getTimeOfDay();
    const dayOfWeek = new Date().getDay();
    
    // Greeting suggestion
    if (context.currentRoute === "/" || context.currentRoute === "/dashboard") {
      const greetings: Record<UserContext["timeOfDay"], string> = {
        morning: "Bom dia! Comece o dia revisando suas tarefas pendentes.",
        afternoon: "Boa tarde! Hora de verificar o progresso das operações.",
        evening: "Boa noite! Revise os relatórios do dia antes de encerrar.",
        night: "Trabalhando até tarde? Não esqueça de descansar!",
      };
      
      suggestions.push({
        id: "greeting",
        type: "tip",
        title: greetings[timeOfDay],
        description: "Clique para ver sua agenda do dia",
        priority: 10,
        context: ["/", "/dashboard"],
        dismissable: true,
      });
    }
    
    // New user suggestions
    if (context.isNewUser) {
      suggestions.push({
        id: "tutorial-start",
        type: "feature",
        title: "Bem-vindo ao Nautilus One!",
        description: "Complete o tutorial interativo para conhecer todas as funcionalidades.",
        actionLabel: "Iniciar Tutorial",
        priority: 100,
        dismissable: false,
      });
    }
    
    // Route-specific suggestions
    const routeSuggestions = this.getRouteSuggestions(context.currentRoute || "/");
    suggestions.push(...routeSuggestions);
    
    // Time-based suggestions
    if (timeOfDay === "morning" && dayOfWeek >= 1 && dayOfWeek <= 5) {
      suggestions.push({
        id: "morning-briefing",
        type: "action",
        title: "Briefing Matinal",
        description: "Veja o resumo das operações e alertas importantes.",
        actionLabel: "Ver Briefing",
        priority: 80,
        dismissable: true,
      });
    }
    
    // End of week suggestion
    if (dayOfWeek === 5 && timeOfDay === "afternoon") {
      suggestions.push({
        id: "weekly-report",
        type: "action",
        title: "Relatório Semanal",
        description: "Gere o relatório semanal antes do fim de semana.",
        actionLabel: "Gerar Relatório",
        priority: 90,
        dismissable: true,
      });
    }
    
    // Filter dismissed and sort by priority
    return suggestions
      .filter(s => !this.dismissedIds.has(s.id))
      .sort((a, b) => b.priority - a.priority);
  }
  
  private getRouteSuggestions(route: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    const routeMap: Record<string, Suggestion[]> = {
      "/travel": [
        {
          id: "travel-bulk",
          type: "shortcut",
          title: "Ação em Massa",
          description: "Selecione múltiplas solicitações para aprovar ou rejeitar de uma vez.",
          priority: 50,
          dismissable: true,
        },
      ],
      "/hr": [
        {
          id: "hr-expiring-docs",
          type: "warning",
          title: "Documentos Expirando",
          description: "Existem documentos de tripulantes que expiram esta semana.",
          actionLabel: "Ver Documentos",
          priority: 85,
          dismissable: true,
        },
      ],
      "/fleet": [
        {
          id: "fleet-maintenance",
          type: "warning",
          title: "Manutenção Programada",
          description: "Verifique as manutenções programadas para os próximos dias.",
          actionLabel: "Ver Agenda",
          priority: 75,
          dismissable: true,
        },
      ],
      "/documents": [
        {
          id: "docs-ai",
          type: "feature",
          title: "IA para Documentos",
          description: "Use nossa IA para extrair dados automaticamente dos documentos.",
          actionLabel: "Experimentar",
          priority: 60,
          dismissable: true,
        },
      ],
    });
    
    return routeMap[route] || [];
  }
  
  /**
   * Dismiss a suggestion
   */
  dismiss(id: string): void {
    this.dismissedIds.add(id);
    this.saveDismissed();
  }
  
  /**
   * Clear all dismissed
   */
  clearDismissed(): void {
    this.dismissedIds.clear();
    this.saveDismissed();
  }
}

// Singleton instance
export const smartSuggestions = new SmartSuggestionsEngine();

/**
 * React hook for smart suggestions
 */
export function useSmartSuggestions(context: Partial<UserContext>) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  useEffect(() => {
    setSuggestions(smartSuggestions.generateSuggestions(context));
  }, [context.currentRoute, context.isNewUser, context.userRole]);
  
  const dismiss = useCallback((id: string) => {
    smartSuggestions.dismiss(id);
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);
  
  const topSuggestion = suggestions[0] || null;
  const otherSuggestions = suggestions.slice(1, 4);
  
  return {
    suggestions,
    topSuggestion,
    otherSuggestions,
    dismiss,
    clearAll: smartSuggestions.clearDismissed.bind(smartSuggestions),
  };
}

/**
 * Hook for contextual help
 */
export function useContextualHelp(featureId: string) {
  const helpContent: Record<string, { title: string; steps: string[] }> = {
    "travel-request": {
      title: "Criando uma Solicitação de Viagem",
      steps: [
        "Preencha os dados do tripulante",
        "Selecione origem e destino",
        "Escolha as datas",
        "Adicione observações se necessário",
        "Envie para aprovação",
      ],
    },
    "document-upload": {
      title: "Upload de Documentos",
      steps: [
        "Arraste o arquivo ou clique para selecionar",
        "A IA extrairá automaticamente os dados",
        "Revise e confirme as informações",
        "O documento será indexado para busca",
      ],
    },
    "fleet-status": {
      title: "Status da Frota",
      steps: [
        "Verde = Operacional",
        "Amarelo = Manutenção programada",
        "Vermelho = Fora de operação",
        "Azul = Em trânsito",
      ],
    },
  };
  
  return helpContent[featureId] || null;
}
