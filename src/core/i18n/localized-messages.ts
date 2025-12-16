/**
 * PATCH 573 - Multilingual Watchdog Messages
 * Sistema de mensagens localizadas para watchdog e alertas
 */

import { SupportedLanguage, aiTranslator } from "@/core/i18n/translator";

export type WatchdogMessageId =
  | "watchdog.starting"
  | "watchdog.stopped"
  | "watchdog.error_detected"
  | "watchdog.autofix_success"
  | "watchdog.autofix_failed"
  | "watchdog.health_check"
  | "watchdog.threshold_reached"
  | "alert.system_error"
  | "alert.api_failure"
  | "alert.import_error"
  | "alert.blank_screen"
  | "alert.performance_degradation"
  | "log.user_action"
  | "log.ai_feedback"
  | "log.system_event";

interface LocalizedMessage {
  id: WatchdogMessageId;
  params?: Record<string, any>;
  language?: SupportedLanguage;
}

/**
 * Mensagens padrão multilíngues
 */
const DEFAULT_MESSAGES: Record<WatchdogMessageId, Record<SupportedLanguage, string>> = {
  "watchdog.starting": {
    pt: "Iniciando System Watchdog v2...",
    en: "Starting System Watchdog v2...",
    es: "Iniciando System Watchdog v2...",
    fr: "Démarrage du System Watchdog v2...",
    de: "Starte System Watchdog v2...",
  },
  "watchdog.stopped": {
    pt: "System Watchdog parado",
    en: "System Watchdog stopped",
    es: "System Watchdog detenido",
    fr: "System Watchdog arrêté",
    de: "System Watchdog gestoppt",
  },
  "watchdog.error_detected": {
    pt: "Erro detectado: {error}",
    en: "Error detected: {error}",
    es: "Error detectado: {error}",
    fr: "Erreur détectée: {error}",
    de: "Fehler erkannt: {error}",
  },
  "watchdog.autofix_success": {
    pt: "Correção automática aplicada com sucesso",
    en: "Auto-fix applied successfully",
    es: "Corrección automática aplicada con éxito",
    fr: "Correction automatique appliquée avec succès",
    de: "Automatische Korrektur erfolgreich angewendet",
  },
  "watchdog.autofix_failed": {
    pt: "Falha na correção automática: {reason}",
    en: "Auto-fix failed: {reason}",
    es: "Fallo en la corrección automática: {reason}",
    fr: "Échec de la correction automatique: {reason}",
    de: "Automatische Korrektur fehlgeschlagen: {reason}",
  },
  "watchdog.health_check": {
    pt: "Verificação de saúde do sistema concluída",
    en: "System health check completed",
    es: "Verificación de salud del sistema completada",
    fr: "Vérification de la santé du système terminée",
    de: "Systemgesundheitsprüfung abgeschlossen",
  },
  "watchdog.threshold_reached": {
    pt: "Limite de {threshold} erros atingido para: {error}",
    en: "Threshold of {threshold} errors reached for: {error}",
    es: "Umbral de {threshold} errores alcanzado para: {error}",
    fr: "Seuil de {threshold} erreurs atteint pour: {error}",
    de: "Schwellenwert von {threshold} Fehlern erreicht für: {error}",
  },
  "alert.system_error": {
    pt: "⚠️ Erro no Sistema: {message}",
    en: "⚠️ System Error: {message}",
    es: "⚠️ Error del Sistema: {message}",
    fr: "⚠️ Erreur Système: {message}",
    de: "⚠️ Systemfehler: {message}",
  },
  "alert.api_failure": {
    pt: "🔴 Falha na API: {endpoint}",
    en: "🔴 API Failure: {endpoint}",
    es: "🔴 Fallo de API: {endpoint}",
    fr: "🔴 Échec de l'API: {endpoint}",
    de: "🔴 API-Fehler: {endpoint}",
  },
  "alert.import_error": {
    pt: "📦 Erro de Importação: {module}",
    en: "📦 Import Error: {module}",
    es: "📦 Error de Importación: {module}",
    fr: "📦 Erreur d'Importation: {module}",
    de: "📦 Importfehler: {module}",
  },
  "alert.blank_screen": {
    pt: "🖥️ Tela em branco detectada",
    en: "🖥️ Blank screen detected",
    es: "🖥️ Pantalla en blanco detectada",
    fr: "🖥️ Écran vide détecté",
    de: "🖥️ Leerer Bildschirm erkannt",
  },
  "alert.performance_degradation": {
    pt: "⚡ Degradação de performance detectada: {metric}",
    en: "⚡ Performance degradation detected: {metric}",
    es: "⚡ Degradación de rendimiento detectada: {metric}",
    fr: "⚡ Dégradation des performances détectée: {metric}",
    de: "⚡ Leistungsabfall erkannt: {metric}",
  },
  "log.user_action": {
    pt: "👤 Ação do usuário: {action}",
    en: "👤 User action: {action}",
    es: "👤 Acción del usuario: {action}",
    fr: "👤 Action utilisateur: {action}",
    de: "👤 Benutzeraktion: {action}",
  },
  "log.ai_feedback": {
    pt: "🤖 Feedback AI: {feedback}",
    en: "🤖 AI Feedback: {feedback}",
    es: "🤖 Retroalimentación IA: {feedback}",
    fr: "🤖 Retour IA: {feedback}",
    de: "🤖 KI-Feedback: {feedback}",
  },
  "log.system_event": {
    pt: "⚙️ Evento do sistema: {event}",
    en: "⚙️ System event: {event}",
    es: "⚙️ Evento del sistema: {event}",
    fr: "⚙️ Événement système: {event}",
    de: "⚙️ Systemereignis: {event}",
  },
};

/**
 * Classe para gerenciar mensagens localizadas
 */
class MultilingualMessageManager {
  private static instance: MultilingualMessageManager;
  private defaultLanguage: SupportedLanguage = "en";

  static getInstance(): MultilingualMessageManager {
    if (!MultilingualMessageManager.instance) {
      MultilingualMessageManager.instance = new MultilingualMessageManager();
    }
    return MultilingualMessageManager.instance;
  }

  /**
   * Define o idioma padrão
   */
  setDefaultLanguage(language: SupportedLanguage) {
    this.defaultLanguage = language;
  }

  /**
   * Obtém o idioma padrão
   */
  getDefaultLanguage(): SupportedLanguage {
    return this.defaultLanguage;
  }

  /**
   * Formata uma mensagem com parâmetros
   */
  private formatMessage(template: string, params?: Record<string, any>): string {
    if (!params) return template;

    let formatted = template;
    for (const [key, value] of Object.entries(params)) {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return formatted;
  }

  /**
   * Obtém uma mensagem localizada
   */
  async getMessage(request: LocalizedMessage): Promise<string> {
    const { id, params, language } = request;
    const targetLang = language || this.defaultLanguage;

    // 1. Tentar obter da mensagem padrão
    const defaultMessage = DEFAULT_MESSAGES[id]?.[targetLang];
    if (defaultMessage) {
      return this.formatMessage(defaultMessage, params);
    }

    // 2. Fallback para inglês
    const englishMessage = DEFAULT_MESSAGES[id]?.["en"];
    if (englishMessage) {
      return this.formatMessage(englishMessage, params);
    }

    // 3. Fallback para AI translation
    try {
      const result = await aiTranslator.translate({
        key: id,
        targetLang,
      });
      return this.formatMessage(result.translation, params);
    } catch (error) {
      // Último fallback - retornar o ID
      return this.formatMessage(id, params);
    }
  }

  /**
   * Obtém múltiplas mensagens de uma vez
   */
  async getMessages(
    requests: LocalizedMessage[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
      requests.map(async (request) => {
        results[request.id] = await this.getMessage(request);
      })
    );

    return results;
  }

  /**
   * Registra uma nova mensagem customizada
   */
  registerMessage(
    id: WatchdogMessageId,
    translations: Partial<Record<SupportedLanguage, string>>
  ) {
    if (!DEFAULT_MESSAGES[id]) {
      DEFAULT_MESSAGES[id] = {
        pt: translations.pt || id,
        en: translations.en || id,
        es: translations.es || id,
        fr: translations.fr || id,
        de: translations.de || id,
      };
    } else {
      // Merge com mensagens existentes
      Object.assign(DEFAULT_MESSAGES[id], translations);
    }
  }
}

// Export singleton
export const messageManager = MultilingualMessageManager.getInstance();

/**
 * Helper para obter mensagem localizada de forma síncrona
 * (usa cache quando possível)
 */
export function getLocalizedMessage(
  id: WatchdogMessageId,
  params?: Record<string, any>,
  language?: SupportedLanguage
): string {
  const targetLang = language || messageManager.getDefaultLanguage();
  const message = DEFAULT_MESSAGES[id]?.[targetLang] || DEFAULT_MESSAGES[id]?.["en"] || id;
  
  if (!params) return message;

  let formatted = message;
  for (const [key, value] of Object.entries(params)) {
    formatted = formatted.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return formatted;
}

/**
 * Helper assíncrono para obter mensagem localizada com AI fallback
 */
export async function getLocalizedMessageAsync(
  id: WatchdogMessageId,
  params?: Record<string, any>,
  language?: SupportedLanguage
): Promise<string> {
  return messageManager.getMessage({ id, params, language });
}
