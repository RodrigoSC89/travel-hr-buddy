/**
 * PATCH 571-575 - i18n Translation System Tests
 * Tests for multilingual translation system
 */

import { describe, it, expect } from "vitest";
import { SupportedLanguage } from "@/core/i18n/translator";
import { getLocalizedMessage } from "@/core/i18n/localized-messages";

describe("PATCH 571-575: i18n Translation System", () => {
  describe("Type Definitions", () => {
    it("should have correct language types", () => {
      const languages: SupportedLanguage[] = ["pt", "en", "es", "fr", "de"];
      
      expect(languages).toHaveLength(5);
      expect(languages).toContain("pt");
      expect(languages).toContain("en");
      expect(languages).toContain("es");
      expect(languages).toContain("fr");
      expect(languages).toContain("de");
    });
  });

  describe("Localized Messages", () => {
    it("should support synchronous message retrieval", () => {
      const message = getLocalizedMessage("watchdog.stopped", undefined, "pt");
      expect(message).toBeTruthy();
      expect(typeof message).toBe("string");
    });

    it("should provide watchdog messages in all languages", () => {
      const languages: SupportedLanguage[] = ["pt", "en", "es", "fr", "de"];

      for (const lang of languages) {
        const message = getLocalizedMessage("watchdog.starting", undefined, lang);
        expect(message).toBeTruthy();
        expect(typeof message).toBe("string");
      }
    });

    it("should format messages with parameters", () => {
      const message = getLocalizedMessage("watchdog.error_detected", { error: "Test Error" }, "en");
      expect(message).toContain("Test Error");
    });

    it("should handle alert messages", () => {
      const alertIds: any[] = [
        "alert.system_error",
        "alert.api_failure",
        "alert.import_error",
        "alert.blank_screen",
        "alert.performance_degradation",
      ];

      for (const id of alertIds) {
        const message = getLocalizedMessage(id, undefined, "en");
        expect(message).toBeTruthy();
      }
    });

    it("should handle log messages", () => {
      const logIds: any[] = [
        "log.user_action",
        "log.ai_feedback",
        "log.system_event",
      ];

      for (const id of logIds) {
        const message = getLocalizedMessage(id, undefined, "en");
        expect(message).toBeTruthy();
      }
    });

    it("should handle different languages for same message", () => {
      const ptMessage = getLocalizedMessage("watchdog.starting", undefined, "pt");
      const enMessage = getLocalizedMessage("watchdog.starting", undefined, "en");
      const esMessage = getLocalizedMessage("watchdog.starting", undefined, "es");
      
      expect(ptMessage).not.toBe(enMessage);
      expect(enMessage).not.toBe(esMessage);
      expect(ptMessage).toContain("Iniciando");
      expect(enMessage).toContain("Starting");
    });
  });

  describe("Module Exports", () => {
    it("should export translator module", async () => {
      const module = await import("@/core/i18n/translator");
      
      expect(module).toHaveProperty("aiTranslator");
      expect(module).toHaveProperty("AITranslator");
    });

    it("should export lang-training module", async () => {
      const module = await import("@/ai/lang-training");
      
      expect(module).toHaveProperty("langTrainingEngine");
      expect(module).toHaveProperty("LangTrainingEngine");
    });

    it("should export localized messages", async () => {
      const module = await import("@/core/i18n/localized-messages");
      
      expect(module).toHaveProperty("messageManager");
      expect(module).toHaveProperty("getLocalizedMessage");
    });
  });
});
