/**
 * usePremiumFeatures - Hook global para funcionalidades premium
 */

import { useState, useEffect, useCallback } from "react";

interface PremiumFeaturesState {
  quickActionsOpen: boolean;
  onboardingOpen: boolean;
  onboardingCompleted: boolean;
}

export function usePremiumFeatures() {
  const [state, setState] = useState<PremiumFeaturesState>({
    quickActionsOpen: false,
    onboardingOpen: false,
    onboardingCompleted: localStorage.getItem("nautilus_onboarding_completed") === "true"
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for quick actions
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setState(prev => ({ ...prev, quickActionsOpen: !prev.quickActionsOpen }));
      }
      
      // Cmd/Ctrl + ? for help/onboarding
      if ((e.metaKey || e.ctrlKey) && e.key === "?") {
        e.preventDefault();
        setState(prev => ({ ...prev, onboardingOpen: true }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check if first visit
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem("nautilus_visited");
    const onboardingCompleted = localStorage.getItem("nautilus_onboarding_completed") === "true";
    
    if (isFirstVisit && !onboardingCompleted) {
      localStorage.setItem("nautilus_visited", "true");
      // Show onboarding after a small delay for better UX
      setTimeout(() => {
        setState(prev => ({ ...prev, onboardingOpen: true }));
      }, 1500);
    }
  }, []);

  const openQuickActions = useCallback(() => {
    setState(prev => ({ ...prev, quickActionsOpen: true }));
  }, []);

  const closeQuickActions = useCallback(() => {
    setState(prev => ({ ...prev, quickActionsOpen: false }));
  }, []);

  const setQuickActionsOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, quickActionsOpen: open }));
  }, []);

  const openOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, onboardingOpen: true }));
  }, []);

  const closeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, onboardingOpen: false }));
  }, []);

  const setOnboardingOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, onboardingOpen: open }));
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("nautilus_onboarding_completed", "true");
    setState(prev => ({ 
      ...prev, 
      onboardingOpen: false,
      onboardingCompleted: true 
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem("nautilus_onboarding_completed");
    setState(prev => ({ ...prev, onboardingCompleted: false }));
  }, []);

  return {
    // State
    quickActionsOpen: state.quickActionsOpen,
    onboardingOpen: state.onboardingOpen,
    onboardingCompleted: state.onboardingCompleted,
    
    // Quick Actions
    openQuickActions,
    closeQuickActions,
    setQuickActionsOpen,
    
    // Onboarding
    openOnboarding,
    closeOnboarding,
    setOnboardingOpen,
    completeOnboarding,
    resetOnboarding
  };
}

export default usePremiumFeatures;
