/**
 * Onboarding System - PATCH 836
 * Interactive, context-aware onboarding for new users
 */

import { useState, useEffect, useCallback } from "react";

interface OnboardingStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  highlight?: boolean;
  action?: {
    label: string;
    onClick?: () => void;
  };
  skipable?: boolean;
  requiredInteraction?: string; // Event to wait for
}

interface OnboardingFlow {
  id: string;
  name: string;
  steps: OnboardingStep[];
  triggerRoute?: string;
  priority: number;
}

interface OnboardingState {
  completedFlows: string[];
  currentFlow: string | null;
  currentStep: number;
  skippedFlows: string[];
}

// Default onboarding flows
const DEFAULT_FLOWS: OnboardingFlow[] = [
  {
    id: "welcome",
    name: "Bem-vindo ao Nautilus",
    priority: 100,
    steps: [
      {
        id: "welcome-1",
        target: "[data-onboarding=\"sidebar\"]",
        title: "Menu de Navegação",
        description: "Acesse todos os módulos do sistema através do menu lateral.",
        position: "right",
        highlight: true,
      },
      {
        id: "welcome-2",
        target: "[data-onboarding=\"search\"]",
        title: "Busca Inteligente",
        description: "Use Ctrl+K para buscar qualquer coisa no sistema.",
        position: "bottom",
        highlight: true,
      },
      {
        id: "welcome-3",
        target: "[data-onboarding=\"notifications\"]",
        title: "Notificações",
        description: "Fique por dentro de todas as atualizações importantes.",
        position: "bottom",
        highlight: true,
      },
      {
        id: "welcome-4",
        target: "[data-onboarding=\"profile\"]",
        title: "Seu Perfil",
        description: "Acesse suas configurações e preferências.",
        position: "left",
        highlight: true,
      },
    ],
  },
  {
    id: "travel-module",
    name: "Módulo de Viagens",
    triggerRoute: "/travel",
    priority: 50,
    steps: [
      {
        id: "travel-1",
        target: "[data-onboarding=\"travel-new\"]",
        title: "Nova Solicitação",
        description: "Crie uma nova solicitação de viagem com apenas alguns cliques.",
        position: "bottom",
        action: { label: "Criar Agora" },
      },
      {
        id: "travel-2",
        target: "[data-onboarding=\"travel-filters\"]",
        title: "Filtros Avançados",
        description: "Filtre e encontre rapidamente as solicitações que precisa.",
        position: "bottom",
      },
      {
        id: "travel-3",
        target: "[data-onboarding=\"travel-bulk\"]",
        title: "Ações em Massa",
        description: "Selecione múltiplas solicitações para aprovar ou rejeitar.",
        position: "left",
      },
    ],
  },
  {
    id: "hr-module",
    name: "Módulo de RH",
    triggerRoute: "/hr",
    priority: 50,
    steps: [
      {
        id: "hr-1",
        target: "[data-onboarding=\"hr-dashboard\"]",
        title: "Dashboard de RH",
        description: "Visualize métricas importantes sobre sua equipe.",
        position: "bottom",
      },
      {
        id: "hr-2",
        target: "[data-onboarding=\"hr-employees\"]",
        title: "Gestão de Tripulantes",
        description: "Gerencie documentos, certificados e informações.",
        position: "right",
      },
    ],
  },
];

class OnboardingEngine {
  private state: OnboardingState;
  private flows: OnboardingFlow[];
  private listeners = new Set<(state: OnboardingState) => void>();
  private storageKey = "nautilus_onboarding";
  
  constructor() {
    this.flows = DEFAULT_FLOWS;
    this.state = this.loadState();
  }
  
  private loadState(): OnboardingState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return {
      completedFlows: [],
      currentFlow: null,
      currentStep: 0,
      skippedFlows: [],
    };
  }
  
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Ignore
    }
  }
  
  private notify(): void {
    this.listeners.forEach(fn => fn(this.state));
  }
  
  /**
   * Register custom onboarding flow
   */
  registerFlow(flow: OnboardingFlow): void {
    const exists = this.flows.findIndex(f => f.id === flow.id);
    if (exists >= 0) {
      this.flows[exists] = flow;
    } else {
      this.flows.push(flow);
    }
  }
  
  /**
   * Get available flows for current context
   */
  getAvailableFlows(currentRoute: string): OnboardingFlow[] {
    return this.flows
      .filter(flow => {
        // Skip completed or skipped flows
        if (this.state.completedFlows.includes(flow.id)) return false;
        if (this.state.skippedFlows.includes(flow.id)) return false;
        
        // Check route trigger
        if (flow.triggerRoute && flow.triggerRoute !== currentRoute) return false;
        
        return true;
      })
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Start an onboarding flow
   */
  startFlow(flowId: string): void {
    const flow = this.flows.find(f => f.id === flowId);
    if (!flow) return;
    
    this.state = {
      ...this.state,
      currentFlow: flowId,
      currentStep: 0,
    };
    this.saveState();
    this.notify();
  }
  
  /**
   * Go to next step
   */
  nextStep(): void {
    if (!this.state.currentFlow) return;
    
    const flow = this.flows.find(f => f.id === this.state.currentFlow);
    if (!flow) return;
    
    if (this.state.currentStep < flow.steps.length - 1) {
      this.state.currentStep++;
    } else {
      // Flow completed
      this.completeFlow();
    }
    
    this.saveState();
    this.notify();
  }
  
  /**
   * Go to previous step
   */
  prevStep(): void {
    if (!this.state.currentFlow || this.state.currentStep === 0) return;
    
    this.state.currentStep--;
    this.saveState();
    this.notify();
  }
  
  /**
   * Complete current flow
   */
  completeFlow(): void {
    if (this.state.currentFlow) {
      this.state.completedFlows.push(this.state.currentFlow);
    }
    this.state.currentFlow = null;
    this.state.currentStep = 0;
    this.saveState();
    this.notify();
  }
  
  /**
   * Skip current flow
   */
  skipFlow(): void {
    if (this.state.currentFlow) {
      this.state.skippedFlows.push(this.state.currentFlow);
    }
    this.state.currentFlow = null;
    this.state.currentStep = 0;
    this.saveState();
    this.notify();
  }
  
  /**
   * Get current step details
   */
  getCurrentStep(): OnboardingStep | null {
    if (!this.state.currentFlow) return null;
    
    const flow = this.flows.find(f => f.id === this.state.currentFlow);
    if (!flow) return null;
    
    return flow.steps[this.state.currentStep] || null;
  }
  
  /**
   * Get current flow
   */
  getCurrentFlow(): OnboardingFlow | null {
    if (!this.state.currentFlow) return null;
    return this.flows.find(f => f.id === this.state.currentFlow) || null;
  }
  
  /**
   * Get progress
   */
  getProgress(): { current: number; total: number; percent: number } {
    const flow = this.getCurrentFlow();
    if (!flow) return { current: 0, total: 0, percent: 0 };
    
    const total = flow.steps.length;
    const current = this.state.currentStep + 1;
    const percent = Math.round((current / total) * 100);
    
    return { current, total, percent };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: OnboardingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Reset all onboarding progress
   */
  reset(): void {
    this.state = {
      completedFlows: [],
      currentFlow: null,
      currentStep: 0,
      skippedFlows: [],
    };
    this.saveState();
    this.notify();
  }
  
  /**
   * Check if user is new
   */
  isNewUser(): boolean {
    return this.state.completedFlows.length === 0 && 
           this.state.skippedFlows.length === 0;
  }
}

// Singleton instance
export const onboardingEngine = new OnboardingEngine();

/**
 * React hook for onboarding
 */
export function useOnboarding(currentRoute: string) {
  const [state, setState] = useState({
    currentStep: onboardingEngine.getCurrentStep(),
    currentFlow: onboardingEngine.getCurrentFlow(),
    progress: onboardingEngine.getProgress(),
    isActive: !!onboardingEngine.getCurrentFlow(),
    isNewUser: onboardingEngine.isNewUser(),
  });
  
  useEffect(() => {
    const unsubscribe = onboardingEngine.subscribe(() => {
      setState({
        currentStep: onboardingEngine.getCurrentStep(),
        currentFlow: onboardingEngine.getCurrentFlow(),
        progress: onboardingEngine.getProgress(),
        isActive: !!onboardingEngine.getCurrentFlow(),
        isNewUser: onboardingEngine.isNewUser(),
      });
    });
    
    return unsubscribe;
  }, []);
  
  // Auto-start relevant flows
  useEffect(() => {
    const available = onboardingEngine.getAvailableFlows(currentRoute);
    if (available.length > 0 && !state.isActive) {
      // Delay to let page render
      const timer = setTimeout(() => {
        onboardingEngine.startFlow(available[0].id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentRoute, state.isActive]);
  
  return {
    ...state,
    next: onboardingEngine.nextStep.bind(onboardingEngine),
    prev: onboardingEngine.prevStep.bind(onboardingEngine),
    skip: onboardingEngine.skipFlow.bind(onboardingEngine),
    complete: onboardingEngine.completeFlow.bind(onboardingEngine),
    reset: onboardingEngine.reset.bind(onboardingEngine),
    startFlow: onboardingEngine.startFlow.bind(onboardingEngine),
  };
}
