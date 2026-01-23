/**
 * AI Notifications Hook - PATCH 852
 * Push notifications for AI decisions pending approval
 */

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAutonomousAI } from './useAutonomousAI';
import type { AIDecision } from '@/lib/autonomy';

interface UseAINotificationsOptions {
  enabled?: boolean;
  soundEnabled?: boolean;
  onDecisionPending?: (decision: AIDecision) => void;
}

export function useAINotifications(options: UseAINotificationsOptions = {}) {
  const { enabled = true, soundEnabled = true, onDecisionPending } = options;
  const { pendingDecisions, statistics } = useAutonomousAI();
  const previousPendingRef = useRef<string[]>([]);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Silent failure - audio not critical
    }
  }, [soundEnabled]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }, []);

  // Send browser notification
  const sendBrowserNotification = useCallback(async (decision: AIDecision) => {
    const hasPermission = await requestPermission();
    
    if (hasPermission && document.hidden) {
      const notification = new Notification('🤖 Decisão IA Pendente', {
        body: `${decision.title}\nConfiança: ${(decision.confidence * 100).toFixed(0)}%`,
        icon: '/nautilus-logo.png',
        badge: '/nautilus-logo.png',
        tag: decision.id,
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  }, [requestPermission]);

  // Show toast notification
  const showToastNotification = useCallback((decision: AIDecision) => {
    const confidencePercent = (decision.confidence * 100).toFixed(0);
    const confidenceLabel = decision.confidence >= 0.85 
      ? `✅ Alta: ${confidencePercent}%` 
      : decision.confidence >= 0.6 
        ? `⚠️ Média: ${confidencePercent}%` 
        : `❌ Baixa: ${confidencePercent}%`;

    toast.warning(
      `🤖 Decisão IA: ${decision.title}`,
      {
        description: `${decision.description} | Confiança: ${confidenceLabel}`,
        duration: 15000,
        action: {
          label: 'Ver',
          onClick: () => {
            onDecisionPending?.(decision);
          }
        }
      }
    );
  }, [onDecisionPending]);

  // Monitor for new pending decisions
  useEffect(() => {
    if (!enabled) return;

    const currentPendingIds = pendingDecisions.map(d => d.id);
    const previousPendingIds = previousPendingRef.current;

    // Find new decisions
    const newDecisions = pendingDecisions.filter(
      d => !previousPendingIds.includes(d.id)
    );

    // Notify for each new decision
    newDecisions.forEach(decision => {
      playNotificationSound();
      showToastNotification(decision);
      sendBrowserNotification(decision);
      onDecisionPending?.(decision);
    });

    previousPendingRef.current = currentPendingIds;
  }, [pendingDecisions, enabled, playNotificationSound, showToastNotification, sendBrowserNotification, onDecisionPending]);

  return {
    pendingCount: statistics.pending,
    requestPermission,
    hasNotificationSupport: typeof Notification !== 'undefined'
  };
}
