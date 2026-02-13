/**
 * Sound Alert Service
 * Plays audio alerts for critical IoT sensor events
 */

import { logger } from "@/lib/logger";

type AlertSeverity = 'critical' | 'warning' | 'info';

interface SoundAlertConfig {
  enabled: boolean;
  volume: number; // 0-1
  criticalEnabled: boolean;
  warningEnabled: boolean;
}

const DEFAULT_CONFIG: SoundAlertConfig = {
  enabled: true,
  volume: 0.7,
  criticalEnabled: true,
  warningEnabled: true,
};

const STORAGE_KEY = 'nautilus_sound_alert_config';

// Audio context for Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

function getConfig(): SoundAlertConfig {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfig(config: Partial<SoundAlertConfig>): void {
  const current = getConfig();
  const updated = { ...current, ...config };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Generate beep sound using Web Audio API
function playBeep(frequency: number, duration: number, volume: number): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    logger.warn('Sound alert playback failed', { error });
  }
}

// Alert sound patterns
function playCriticalAlert(volume: number): void {
  // Three rapid high-pitched beeps
  playBeep(880, 0.15, volume);
  setTimeout(() => playBeep(880, 0.15, volume), 200);
  setTimeout(() => playBeep(880, 0.15, volume), 400);
}

function playWarningAlert(volume: number): void {
  // Two medium-pitched beeps
  playBeep(660, 0.2, volume);
  setTimeout(() => playBeep(660, 0.2, volume), 300);
}

function playInfoAlert(volume: number): void {
  // Single soft beep
  playBeep(440, 0.15, volume * 0.5);
}

export const soundAlertService = {
  getConfig,
  
  setEnabled(enabled: boolean): void {
    saveConfig({ enabled });
  },

  setVolume(volume: number): void {
    saveConfig({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setCriticalEnabled(enabled: boolean): void {
    saveConfig({ criticalEnabled: enabled });
  },

  setWarningEnabled(enabled: boolean): void {
    saveConfig({ warningEnabled: enabled });
  },

  playAlert(severity: AlertSeverity): void {
    const config = getConfig();
    
    if (!config.enabled) return;

    switch (severity) {
      case 'critical':
        if (config.criticalEnabled) {
          playCriticalAlert(config.volume);
        }
        break;
      case 'warning':
        if (config.warningEnabled) {
          playWarningAlert(config.volume);
        }
        break;
      case 'info':
        playInfoAlert(config.volume);
        break;
    }
  },

  // Test sound playback
  testSound(): void {
    const config = getConfig();
    playBeep(660, 0.3, config.volume);
  },
};
