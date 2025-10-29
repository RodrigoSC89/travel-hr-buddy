/**
 * PATCH 571-572 - i18n Module
 * Sistema de internacionalização com tradução AI
 */

export * from "./translator";
export * from "./ui-hooks";

// Re-export principais funções
export { aiTranslator } from "./translator";
export { useTranslation, useI18n, I18nProvider } from "./ui-hooks";
