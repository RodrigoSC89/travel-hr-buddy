/**
 * Dashboard Watchdog Integration
 * PATCH 626 - Auto-healing visual watchdog
 */

import { useEffect, useState, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardWatchdogProps {
  onHeal?: () => void;
}

interface WatchdogState {
  hasBlankScreen: boolean;
  hasFrozenUI: boolean;
  hasMissingMetrics: boolean;
  lastCheck: Date;
  autoHealAttempts: number;
}

export function DashboardWatchdog({ onHeal }: DashboardWatchdogProps) {
  const [state, setState] = useState<WatchdogState>({
    hasBlankScreen: false,
    hasFrozenUI: false,
    hasMissingMetrics: false,
    lastCheck: new Date(),
    autoHealAttempts: 0
  });
  const [isHealing, setIsHealing] = useState(false);

  /**
   * Detect blank screen
   */
  const checkBlankScreen = useCallback(() => {
    const mainContent = document.querySelector('[data-dashboard-content]');
    const hasVisibleContent = mainContent && mainContent.children.length > 0;
    return !hasVisibleContent;
  }, []);

  /**
   * Detect frozen UI (no DOM updates in last 10s)
   */
  const checkFrozenUI = useCallback(() => {
    // Check if there are any pending animations or transitions
    const hasActiveAnimations = document.getAnimations().length > 0;
    const lastInteraction = (window as any).__lastInteractionTime || Date.now();
    const timeSinceInteraction = Date.now() - lastInteraction;
    
    // UI is frozen if no animations and no interactions for 30s
    return !hasActiveAnimations && timeSinceInteraction > 30000;
  }, []);

  /**
   * Detect missing critical metrics
   */
  const checkMissingMetrics = useCallback(() => {
    const kpiCards = document.querySelectorAll('[data-kpi-card]');
    const loadingCards = document.querySelectorAll('[data-kpi-loading]');
    
    // If we have KPI containers but all are in loading state for > 10s
    return kpiCards.length > 0 && kpiCards.length === loadingCards.length;
  }, []);

  /**
   * Run all checks
   */
  const runWatchdogChecks = useCallback(() => {
    const blankScreen = checkBlankScreen();
    const frozenUI = checkFrozenUI();
    const missingMetrics = checkMissingMetrics();

    setState(prev => ({
      ...prev,
      hasBlankScreen: blankScreen,
      hasFrozenUI: frozenUI,
      hasMissingMetrics: missingMetrics,
      lastCheck: new Date()
    }));

    // Log to database if any issues detected
    if (blankScreen || frozenUI || missingMetrics) {
      logWatchdogEvent({
        blank_screen: blankScreen,
        frozen_ui: frozenUI,
        missing_metrics: missingMetrics
      });
    }

    return blankScreen || frozenUI || missingMetrics;
  }, [checkBlankScreen, checkFrozenUI, checkMissingMetrics]);

  /**
   * Attempt auto-healing
   */
  const attemptAutoHeal = useCallback(async () => {
    setIsHealing(true);
    
    try {
      console.log('[Watchdog] Attempting auto-heal...');
      
      // Log healing attempt
      await logWatchdogEvent({
        blank_screen: state.hasBlankScreen,
        frozen_ui: state.hasFrozenUI,
        missing_metrics: state.hasMissingMetrics,
        action: 'auto_heal_attempt',
        attempt_number: state.autoHealAttempts + 1
      });

      // Trigger re-render
      if (onHeal) {
        onHeal();
      }

      // Update attempts counter
      setState(prev => ({
        ...prev,
        autoHealAttempts: prev.autoHealAttempts + 1
      }));

      // Wait a bit and re-check
      setTimeout(() => {
        const stillHasIssues = runWatchdogChecks();
        
        if (!stillHasIssues) {
          console.log('[Watchdog] Auto-heal successful');
          logWatchdogEvent({
            action: 'auto_heal_success',
            attempt_number: state.autoHealAttempts + 1
          });
        } else {
          console.warn('[Watchdog] Auto-heal failed, issues persist');
          logWatchdogEvent({
            action: 'auto_heal_failed',
            attempt_number: state.autoHealAttempts + 1
          });
        }
        
        setIsHealing(false);
      }, 2000);

    } catch (error) {
      console.error('[Watchdog] Auto-heal error:', error);
      setIsHealing(false);
      
      await logWatchdogEvent({
        action: 'auto_heal_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [state, onHeal, runWatchdogChecks]);

  /**
   * Manual heal trigger
   */
  const manualHeal = useCallback(() => {
    console.log('[Watchdog] Manual heal triggered');
    logWatchdogEvent({ action: 'manual_heal_trigger' });
    attemptAutoHeal();
  }, [attemptAutoHeal]);

  // Set up periodic checks
  useEffect(() => {
    const interval = setInterval(() => {
      runWatchdogChecks();
    }, 5000); // Check every 5 seconds

    // Track user interactions
    const updateInteractionTime = () => {
      (window as any).__lastInteractionTime = Date.now();
    };

    window.addEventListener('click', updateInteractionTime);
    window.addEventListener('keydown', updateInteractionTime);
    window.addEventListener('scroll', updateInteractionTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', updateInteractionTime);
      window.removeEventListener('keydown', updateInteractionTime);
      window.removeEventListener('scroll', updateInteractionTime);
    };
  }, [runWatchdogChecks]);

  // Show alert if issues detected
  const hasIssues = state.hasBlankScreen || state.hasFrozenUI || state.hasMissingMetrics;

  if (!hasIssues) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Problema Detectado no Dashboard</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          {state.hasBlankScreen && <p>• Tela em branco detectada</p>}
          {state.hasFrozenUI && <p>• Interface congelada</p>}
          {state.hasMissingMetrics && <p>• Métricas não carregadas</p>}
          <p className="text-xs mt-2">
            Última verificação: {state.lastCheck.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={manualHeal}
          disabled={isHealing}
          className="ml-4"
        >
          {isHealing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Corrigindo...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Tentar Corrigir
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Log watchdog event to database
 */
async function logWatchdogEvent(data: Record<string, any>) {
  try {
    const { error } = await supabase.from('watchdog_logs').insert({
      ...data,
      component: 'dashboard',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    });

    if (error) {
      console.error('[Watchdog] Failed to log event:', error);
    }
  } catch (error) {
    console.error('[Watchdog] Error logging event:', error);
  }
}
