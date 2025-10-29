/**
 * PATCH 571-575 - i18n Translation System Tests
 * Tests for multilingual translation system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AITranslator, SupportedLanguage } from '@/core/i18n/translator';
import { messageManager, getLocalizedMessage } from '@/core/i18n/localized-messages';

describe('PATCH 571-575: i18n Translation System', () => {
  describe('AITranslator', () => {
    let translator: AITranslator;

    beforeEach(() => {
      translator = AITranslator.getInstance();
    });

    it('should detect browser language', () => {
      const language = translator.detectBrowserLanguage();
      expect(language).toBeDefined();
      expect(['pt', 'en', 'es', 'fr', 'de']).toContain(language);
    });

    it('should support all 5 languages', async () => {
      const languages: SupportedLanguage[] = ['pt', 'en', 'es', 'fr', 'de'];
      
      for (const lang of languages) {
        const result = await translator.translate({
          key: 'common.welcome',
          targetLang: lang,
        });

        expect(result).toBeDefined();
        expect(result.translation).toBeTruthy();
        expect(result.source).toMatch(/json|ai|fallback/);
      }
    });

    it('should cache translations', async () => {
      const result1 = await translator.translate({
        key: 'common.loading',
        targetLang: 'en',
      });

      const result2 = await translator.translate({
        key: 'common.loading',
        targetLang: 'en',
      });

      // Second call should be cached
      expect(result2.cached).toBe(true);
    });

    it('should handle batch translation', async () => {
      const keys = ['common.save', 'common.cancel', 'common.delete'];
      const results = await translator.translateBatch(keys, 'pt');

      expect(Object.keys(results)).toHaveLength(3);
      for (const key of keys) {
        expect(results[key]).toBeDefined();
        expect(results[key].translation).toBeTruthy();
      }
    });

    it('should provide translation statistics', () => {
      const stats = translator.getStatistics();

      expect(stats).toHaveProperty('totalTranslations');
      expect(stats).toHaveProperty('byLanguage');
      expect(stats).toHaveProperty('bySource');
    });
  });

  describe('Localized Messages', () => {
    it('should provide watchdog messages in all languages', async () => {
      const languages: SupportedLanguage[] = ['pt', 'en', 'es', 'fr', 'de'];

      for (const lang of languages) {
        const message = await messageManager.getMessage({
          id: 'watchdog.starting',
          language: lang,
        });

        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      }
    });

    it('should format messages with parameters', async () => {
      const message = await messageManager.getMessage({
        id: 'watchdog.error_detected',
        params: { error: 'Test Error' },
        language: 'en',
      });

      expect(message).toContain('Test Error');
    });

    it('should support synchronous message retrieval', () => {
      const message = getLocalizedMessage('watchdog.stopped', undefined, 'pt');
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });

    it('should handle alert messages', async () => {
      const alertIds = [
        'alert.system_error',
        'alert.api_failure',
        'alert.import_error',
        'alert.blank_screen',
        'alert.performance_degradation',
      ];

      for (const id of alertIds) {
        const message = await messageManager.getMessage({
          id: id as any,
          language: 'en',
        });

        expect(message).toBeTruthy();
      }
    });

    it('should handle log messages', async () => {
      const logIds = [
        'log.user_action',
        'log.ai_feedback',
        'log.system_event',
      ];

      for (const id of logIds) {
        const message = await messageManager.getMessage({
          id: id as any,
          language: 'en',
        });

        expect(message).toBeTruthy();
      }
    });
  });

  describe('Language Training', () => {
    it('should have training engine available', async () => {
      // Import dynamically to avoid initialization issues
      const { langTrainingEngine } = await import('@/ai/lang-training');
      
      expect(langTrainingEngine).toBeDefined();
      expect(typeof langTrainingEngine.getTrainingMetrics).toBe('function');
      expect(typeof langTrainingEngine.isCurrentlyTraining).toBe('function');
    });
  });

  describe('Integration Tests', () => {
    it('should handle full translation flow', async () => {
      const translator = AITranslator.getInstance();

      // Initialize
      await translator.initialize();

      // Translate
      const result = await translator.translate({
        key: 'common.success',
        targetLang: 'pt',
      });

      expect(result).toBeDefined();
      expect(result.translation).toBeTruthy();

      // Check cache
      const cached = await translator.translate({
        key: 'common.success',
        targetLang: 'pt',
      });

      expect(cached.cached).toBe(true);
    });

    it('should handle fallback gracefully', async () => {
      const translator = AITranslator.getInstance();

      const result = await translator.translate({
        key: 'nonexistent.key.that.does.not.exist',
        targetLang: 'en',
      });

      expect(result).toBeDefined();
      expect(result.translation).toBeTruthy();
      // Should fallback to either AI or key itself
      expect(['ai', 'fallback']).toContain(result.source);
    });
  });
});
