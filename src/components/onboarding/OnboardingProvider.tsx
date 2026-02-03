/**
 * Onboarding Provider
 * Wraps the app and shows onboarding tour for new users
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { OnboardingTour, TourStep } from './OnboardingTour';
import { toast } from 'sonner';

interface OnboardingContextType {
  startTour: () => void;
  resetTour: () => void;
  isTourComplete: () => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
  customSteps?: TourStep[];
  storageKey?: string;
}

export function OnboardingProvider({
  children,
  customSteps,
  storageKey = 'nauti-onboarding-complete',
}: OnboardingProviderProps) {
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setShowTour(true);
  }, [storageKey]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const isTourComplete = useCallback(() => {
    return localStorage.getItem(storageKey) === 'true';
  }, [storageKey]);

  const handleComplete = () => {
    setShowTour(false);
    toast.success('Tour concluído!', {
      description: 'Explore o sistema e aproveite todas as funcionalidades.',
    });
  };

  const handleSkip = () => {
    setShowTour(false);
  };

  return (
    <OnboardingContext.Provider value={{ startTour, resetTour, isTourComplete }}>
      {children}
      {showTour && (
        <OnboardingTour
          steps={customSteps}
          onComplete={handleComplete}
          onSkip={handleSkip}
          storageKey={storageKey}
        />
      )}
    </OnboardingContext.Provider>
  );
}

export default OnboardingProvider;
