/**
 * PATCH 566 - Voice Presenter Hook
 * Manages Web Speech API for voice narration
 */

import { useState, useEffect, useCallback } from "react";
import { VoiceConfig } from "./types";
import { logger } from "@/lib/logger";

export const useVoicePresenter = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [config, setConfig] = useState<VoiceConfig>({
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    lang: "en-US",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Select a default voice (prefer English voices)
        const defaultVoice = availableVoices.find(
          (voice) => voice.lang.startsWith("en") && voice.name.includes("Google")
        ) || availableVoices.find((voice) => voice.lang.startsWith("en"));
        
        if (defaultVoice) {
          setConfig((prev) => ({ ...prev, voice: defaultVoice }));
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!isSupported) {
          logger.warn("[VoicePresenter] Speech synthesis not supported");
          resolve();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.volume = config.volume;
        utterance.lang = config.lang;
        
        if (config.voice) {
          utterance.voice = config.voice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          logger.info("[VoicePresenter] Speaking:", text.substring(0, 50) + "...");
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          logger.error("[VoicePresenter] Speech error:", event.error);
          reject(event.error);
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, config]
  );

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    voices,
    config,
    setConfig,
    speak,
    stop,
    pause,
    resume,
  };
};
