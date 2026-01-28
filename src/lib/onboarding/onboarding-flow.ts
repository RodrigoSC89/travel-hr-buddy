/**
 * User Onboarding System - PROMPT 16
 * Interactive tours and progressive disclosure
 */

export interface OnboardingStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "input" | "observe";
  highlight?: boolean;
  skippable?: boolean;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  targetRole?: string;
  autoStart?: boolean;
  priority: number;
}

// Predefined onboarding flows
export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: "welcome",
    name: "Bem-vindo ao Nautilus One",
    description: "Tour inicial do sistema",
    priority: 1,
    autoStart: true,
    steps: [
      {
        id: "welcome-1",
        target: "body",
        title: "🚀 Bem-vindo ao Nautilus One!",
        content: "O sistema de gestão marítima mais avançado do mercado. Vamos fazer um tour rápido para você conhecer as principais funcionalidades.",
        position: "center",
        highlight: false,
      },
      {
        id: "welcome-2",
        target: "[data-tour='sidebar']",
        title: "📋 Menu Principal",
        content: "Aqui você encontra todos os módulos do sistema: Frota, Tripulação, Manutenção, Compliance e muito mais.",
        position: "right",
        highlight: true,
      },
      {
        id: "welcome-3",
        target: "[data-tour='dashboard']",
        title: "📊 Dashboard",
        content: "Visão geral em tempo real de toda sua operação marítima. KPIs, alertas e métricas importantes.",
        position: "bottom",
        highlight: true,
      },
      {
        id: "welcome-4",
        target: "[data-tour='ai-assistant']",
        title: "🤖 Assistente de IA",
        content: "Nosso assistente inteligente está sempre disponível para ajudar. Pergunte qualquer coisa!",
        position: "left",
        highlight: true,
      },
      {
        id: "welcome-5",
        target: "[data-tour='notifications']",
        title: "🔔 Notificações",
        content: "Alertas importantes, prazos de certificados, manutenções pendentes - tudo em um só lugar.",
        position: "bottom",
        highlight: true,
      },
    ],
  },
  {
    id: "crew-management",
    name: "Gestão de Tripulação",
    description: "Como gerenciar sua tripulação",
    priority: 2,
    steps: [
      {
        id: "crew-1",
        target: "[data-tour='crew-list']",
        title: "👥 Lista de Tripulantes",
        content: "Visualize todos os membros da tripulação, status de documentos e certificações.",
        position: "right",
        highlight: true,
      },
      {
        id: "crew-2",
        target: "[data-tour='add-crew']",
        title: "➕ Adicionar Tripulante",
        content: "Cadastre novos tripulantes com todos os documentos necessários.",
        position: "bottom",
        highlight: true,
        action: "click",
      },
      {
        id: "crew-3",
        target: "[data-tour='crew-documents']",
        title: "📄 Documentos",
        content: "Gerencie certificados, vistos, passaportes e outros documentos. O sistema alerta quando estiverem próximos do vencimento.",
        position: "left",
        highlight: true,
      },
    ],
  },
  {
    id: "fleet-management",
    name: "Gestão de Frota",
    description: "Como gerenciar suas embarcações",
    priority: 3,
    steps: [
      {
        id: "fleet-1",
        target: "[data-tour='vessel-list']",
        title: "🚢 Suas Embarcações",
        content: "Visão geral de toda sua frota com status em tempo real.",
        position: "right",
        highlight: true,
      },
      {
        id: "fleet-2",
        target: "[data-tour='vessel-position']",
        title: "📍 Posição em Tempo Real",
        content: "Acompanhe a posição de cada embarcação no mapa interativo.",
        position: "bottom",
        highlight: true,
      },
      {
        id: "fleet-3",
        target: "[data-tour='vessel-maintenance']",
        title: "🔧 Manutenção",
        content: "Histórico completo de manutenções e próximas ações programadas.",
        position: "left",
        highlight: true,
      },
    ],
  },
];

class OnboardingManager {
  private completedFlows: Set<string>;
  private currentFlow: OnboardingFlow | null = null;
  private currentStepIndex = 0;
  private listeners: Set<(state: OnboardingState) => void> = new Set();

  constructor() {
    this.completedFlows = new Set(
      JSON.parse(localStorage.getItem("completed_onboarding") || "[]")
    );
  }

  /**
   * Get available flows for user
   */
  getAvailableFlows(userRole?: string): OnboardingFlow[] {
    return ONBOARDING_FLOWS.filter((flow) => {
      if (this.completedFlows.has(flow.id)) return false;
      if (flow.targetRole && flow.targetRole !== userRole) return false;
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Start an onboarding flow
   */
  startFlow(flowId: string): boolean {
    const flow = ONBOARDING_FLOWS.find((f) => f.id === flowId);
    if (!flow) return false;

    this.currentFlow = flow;
    this.currentStepIndex = 0;
    this.notifyListeners();
    return true;
  }

  /**
   * Get current step
   */
  getCurrentStep(): OnboardingStep | null {
    if (!this.currentFlow) return null;
    return this.currentFlow.steps[this.currentStepIndex] || null;
  }

  /**
   * Go to next step
   */
  nextStep(): boolean {
    if (!this.currentFlow) return false;

    if (this.currentStepIndex < this.currentFlow.steps.length - 1) {
      this.currentStepIndex++;
      this.notifyListeners();
      return true;
    }

    // Flow completed
    this.completeFlow();
    return false;
  }

  /**
   * Go to previous step
   */
  previousStep(): boolean {
    if (!this.currentFlow || this.currentStepIndex === 0) return false;
    this.currentStepIndex--;
    this.notifyListeners();
    return true;
  }

  /**
   * Skip current flow
   */
  skipFlow(): void {
    if (this.currentFlow) {
      this.completeFlow();
    }
  }

  /**
   * Complete current flow
   */
  private completeFlow(): void {
    if (!this.currentFlow) return;

    this.completedFlows.add(this.currentFlow.id);
    localStorage.setItem(
      "completed_onboarding",
      JSON.stringify([...this.completedFlows])
    );

    this.currentFlow = null;
    this.currentStepIndex = 0;
    this.notifyListeners();
  }

  /**
   * Reset all onboarding progress
   */
  resetProgress(): void {
    this.completedFlows.clear();
    localStorage.removeItem("completed_onboarding");
    this.currentFlow = null;
    this.currentStepIndex = 0;
    this.notifyListeners();
  }

  /**
   * Get onboarding state
   */
  getState(): OnboardingState {
    return {
      isActive: this.currentFlow !== null,
      currentFlow: this.currentFlow,
      currentStep: this.getCurrentStep(),
      currentStepIndex: this.currentStepIndex,
      totalSteps: this.currentFlow?.steps.length || 0,
      completedFlows: [...this.completedFlows],
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: OnboardingState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }
}

export interface OnboardingState {
  isActive: boolean;
  currentFlow: OnboardingFlow | null;
  currentStep: OnboardingStep | null;
  currentStepIndex: number;
  totalSteps: number;
  completedFlows: string[];
}

export const onboardingManager = new OnboardingManager();
