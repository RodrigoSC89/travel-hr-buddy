/**
 * Automated Onboarding Flow
 * Multi-step onboarding for new tenants/users
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  isComplete: boolean;
  progress: number;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Configurar Perfil',
    description: 'Complete suas informações básicas',
    completed: false,
    required: true,
  },
  {
    id: 'organization',
    title: 'Dados da Organização',
    description: 'Configure sua empresa ou embarcação',
    completed: false,
    required: true,
  },
  {
    id: 'vessels',
    title: 'Cadastrar Embarcações',
    description: 'Adicione suas embarcações ao sistema',
    completed: false,
    required: false,
  },
  {
    id: 'crew',
    title: 'Cadastrar Tripulação',
    description: 'Adicione membros da tripulação',
    completed: false,
    required: false,
  },
  {
    id: 'documents',
    title: 'Documentos Iniciais',
    description: 'Faça upload de documentos importantes',
    completed: false,
    required: false,
  },
  {
    id: 'integrations',
    title: 'Integrações',
    description: 'Configure integrações com sistemas externos',
    completed: false,
    required: false,
  },
  {
    id: 'billing',
    title: 'Plano de Assinatura',
    description: 'Escolha seu plano de assinatura',
    completed: false,
    required: true,
  },
];

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    totalSteps: DEFAULT_STEPS.length,
    steps: DEFAULT_STEPS,
    isComplete: false,
    progress: 0,
  });

  const loadProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load onboarding progress from user metadata
      const metadata = user.user_metadata || {};
      
      if (metadata.onboarding_completed) {
        setState(prev => ({
          ...prev,
          isComplete: true,
          progress: 100,
          currentStep: prev.totalSteps,
        }));
      } else if (metadata.onboarding_step) {
        const stepIndex = DEFAULT_STEPS.findIndex(s => s.id === metadata.onboarding_step);
        setState(prev => ({
          ...prev,
          currentStep: stepIndex >= 0 ? stepIndex : 0,
          progress: Math.round((stepIndex / prev.totalSteps) * 100),
        }));
      }
    } catch (error) {
      logger.error('Failed to load onboarding progress:', error);
    }
  }, []);

  const completeStep = useCallback(async (stepId: string) => {
    setState(prev => {
      const updatedSteps = prev.steps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      );
      const completedCount = updatedSteps.filter(s => s.completed).length;
      const progress = Math.round((completedCount / prev.totalSteps) * 100);
      const nextStep = Math.min(prev.currentStep + 1, prev.totalSteps - 1);
      const allRequiredComplete = updatedSteps
        .filter(s => s.required)
        .every(s => s.completed);

      return {
        ...prev,
        steps: updatedSteps,
        currentStep: nextStep,
        progress,
        isComplete: allRequiredComplete,
      };
    });

    // Save progress to user metadata
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            onboarding_step: stepId,
          }
        });
      }
    } catch (error) {
      logger.error('Failed to save onboarding progress:', error);
    }

    toast.success('Etapa concluída!');
  }, []);

  const skipStep = useCallback((stepId: string) => {
    const step = state.steps.find(s => s.id === stepId);
    if (step?.required) {
      toast.error('Esta etapa é obrigatória');
      return;
    }

    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, [state.steps]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < state.totalSteps) {
      setState(prev => ({ ...prev, currentStep: stepIndex }));
    }
  }, [state.totalSteps]);

  const finishOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update user metadata for onboarding completion
        await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
          }
        });
      }

      setState(prev => ({
        ...prev,
        isComplete: true,
        progress: 100,
      }));

      toast.success('Onboarding concluído! Bem-vindo ao Nautilus One!');
    } catch (error) {
      toast.error('Erro ao finalizar onboarding');
    }
  }, []);

  return {
    ...state,
    loadProgress,
    completeStep,
    skipStep,
    goToStep,
    finishOnboarding,
  };
}
