/**
 * API Services Index
 * Central export point for all external API integrations
 */

// AI & LLM Services
export { openaiService, OpenAIService } from './openai';

// Voice Services
export { voiceService, VoiceService } from './voice';

// Travel Services
export { skyscannerService, SkyscannerService } from './skyscanner';

// Hotel Services
export { bookingService, BookingService } from './booking';

// Maps & Location Services
export { mapboxService, MapboxService } from './mapbox';

// Weather Services
export { windyService, WindyService } from './windy';

// Fleet & Vessel Tracking
export { marineTrafficService, MarineTrafficService } from './marinetraffic';

// OCR Services
export { ocrService } from './ocr-service';

// Testing Utilities
export { apiTester, APIIntegrationTester } from './api-test-utils';
export type { ServiceTestResult, TestReport } from './api-test-utils';

/**
 * Service Status Summary
 */
export const getServicesStatus = () => {
  return {
    ai: {
      openai: openaiService.isConfigured(),
    },
    voice: {
      browser: voiceService.isBrowserRecognitionAvailable() && voiceService.isBrowserSynthesisAvailable(),
      whisper: voiceService.isWhisperConfigured(),
      elevenlabs: voiceService.isElevenLabsConfigured(),
    },
    travel: {
      skyscanner: skyscannerService.isConfigured(),
    },
    hotels: {
      booking: bookingService.isConfigured(),
    },
    maps: {
      mapbox: mapboxService.isConfigured(),
    },
    weather: {
      windy: windyService.isConfigured(),
    },
    fleet: {
      marinetraffic: marineTrafficService.isConfigured(),
    },
  };
};

/**
 * Check if all critical services are configured
 */
export const areCriticalServicesConfigured = () => {
  const status = getServicesStatus();
  return (
    status.ai.openai &&
    status.maps.mapbox &&
    (status.voice.browser || status.voice.whisper)
  );
};

/**
 * Get list of missing critical services
 */
export const getMissingCriticalServices = (): string[] => {
  const missing: string[] = [];
  const status = getServicesStatus();

  if (!status.ai.openai) {
    missing.push('OpenAI API (Required for AI features)');
  }
  if (!status.maps.mapbox) {
    missing.push('Mapbox (Required for maps)');
  }
  if (!status.voice.browser && !status.voice.whisper) {
    missing.push('Voice Recognition (Browser or Whisper required)');
  }

  return missing;
};
