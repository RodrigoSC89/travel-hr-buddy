/**
 * Multilingual System - PATCH 950
 * Offline-first internationalization (PT, EN, ES)
 */

export type SupportedLanguage = "pt" | "en" | "es";

export interface TranslationEntry {
  pt: string;
  en: string;
  es: string;
}

export interface TranslationNamespace {
  [key: string]: TranslationEntry | TranslationNamespace;
}

// Core translations
const TRANSLATIONS: Record<string, TranslationNamespace> = {
  common: {
    save: { pt: "Salvar", en: "Save", es: "Guardar" },
    cancel: { pt: "Cancelar", en: "Cancel", es: "Cancelar" },
    delete: { pt: "Excluir", en: "Delete", es: "Eliminar" },
    edit: { pt: "Editar", en: "Edit", es: "Editar" },
    add: { pt: "Adicionar", en: "Add", es: "Añadir" },
    search: { pt: "Buscar", en: "Search", es: "Buscar" },
    filter: { pt: "Filtrar", en: "Filter", es: "Filtrar" },
    loading: { pt: "Carregando...", en: "Loading...", es: "Cargando..." },
    error: { pt: "Erro", en: "Error", es: "Error" },
    success: { pt: "Sucesso", en: "Success", es: "Éxito" },
    confirm: { pt: "Confirmar", en: "Confirm", es: "Confirmar" },
    back: { pt: "Voltar", en: "Back", es: "Volver" },
    next: { pt: "Próximo", en: "Next", es: "Siguiente" },
    previous: { pt: "Anterior", en: "Previous", es: "Anterior" },
    yes: { pt: "Sim", en: "Yes", es: "Sí" },
    no: { pt: "Não", en: "No", es: "No" },
    close: { pt: "Fechar", en: "Close", es: "Cerrar" },
    open: { pt: "Abrir", en: "Open", es: "Abrir" },
    settings: { pt: "Configurações", en: "Settings", es: "Configuración" },
    help: { pt: "Ajuda", en: "Help", es: "Ayuda" },
    logout: { pt: "Sair", en: "Logout", es: "Salir" },
  },

  navigation: {
    dashboard: { pt: "Painel", en: "Dashboard", es: "Panel" },
    fleet: { pt: "Frota", en: "Fleet", es: "Flota" },
    maintenance: { pt: "Manutenção", en: "Maintenance", es: "Mantenimiento" },
    crew: { pt: "Tripulação", en: "Crew", es: "Tripulación" },
    reports: { pt: "Relatórios", en: "Reports", es: "Informes" },
    compliance: { pt: "Conformidade", en: "Compliance", es: "Cumplimiento" },
    analytics: { pt: "Análises", en: "Analytics", es: "Análisis" },
    documents: { pt: "Documentos", en: "Documents", es: "Documentos" },
    ai_assistant: { pt: "Assistente IA", en: "AI Assistant", es: "Asistente IA" },
  },

  status: {
    online: { pt: "Online", en: "Online", es: "En línea" },
    offline: { pt: "Offline", en: "Offline", es: "Sin conexión" },
    syncing: { pt: "Sincronizando...", en: "Syncing...", es: "Sincronizando..." },
    synced: { pt: "Sincronizado", en: "Synced", es: "Sincronizado" },
    pending: { pt: "Pendente", en: "Pending", es: "Pendiente" },
    active: { pt: "Ativo", en: "Active", es: "Activo" },
    inactive: { pt: "Inativo", en: "Inactive", es: "Inactivo" },
    completed: { pt: "Concluído", en: "Completed", es: "Completado" },
    in_progress: { pt: "Em andamento", en: "In Progress", es: "En progreso" },
  },

  maintenance: {
    title: { pt: "Manutenção", en: "Maintenance", es: "Mantenimiento" },
    preventive: { pt: "Preventiva", en: "Preventive", es: "Preventivo" },
    corrective: { pt: "Corretiva", en: "Corrective", es: "Correctivo" },
    emergency: { pt: "Emergencial", en: "Emergency", es: "Emergencia" },
    scheduled: { pt: "Programada", en: "Scheduled", es: "Programado" },
    overdue: { pt: "Atrasada", en: "Overdue", es: "Atrasado" },
    equipment: { pt: "Equipamento", en: "Equipment", es: "Equipo" },
    task: { pt: "Tarefa", en: "Task", es: "Tarea" },
    priority: {
      low: { pt: "Baixa", en: "Low", es: "Baja" },
      medium: { pt: "Média", en: "Medium", es: "Media" },
      high: { pt: "Alta", en: "High", es: "Alta" },
      critical: { pt: "Crítica", en: "Critical", es: "Crítica" },
    },
  },

  fleet: {
    title: { pt: "Frota", en: "Fleet", es: "Flota" },
    vessel: { pt: "Embarcação", en: "Vessel", es: "Embarcación" },
    vessels: { pt: "Embarcações", en: "Vessels", es: "Embarcaciones" },
    position: { pt: "Posição", en: "Position", es: "Posición" },
    speed: { pt: "Velocidade", en: "Speed", es: "Velocidad" },
    course: { pt: "Rumo", en: "Course", es: "Rumbo" },
    destination: { pt: "Destino", en: "Destination", es: "Destino" },
    eta: { pt: "Chegada Prevista", en: "ETA", es: "Hora de llegada" },
    status: {
      sailing: { pt: "Navegando", en: "Sailing", es: "Navegando" },
      anchored: { pt: "Ancorado", en: "Anchored", es: "Anclado" },
      docked: { pt: "Atracado", en: "Docked", es: "Atracado" },
      maintenance: { pt: "Em manutenção", en: "Under maintenance", es: "En mantenimiento" },
    },
  },

  crew: {
    title: { pt: "Tripulação", en: "Crew", es: "Tripulación" },
    member: { pt: "Tripulante", en: "Crew member", es: "Tripulante" },
    position: { pt: "Cargo", en: "Position", es: "Cargo" },
    certificate: { pt: "Certificado", en: "Certificate", es: "Certificado" },
    schedule: { pt: "Escala", en: "Schedule", es: "Horario" },
    onboard: { pt: "A bordo", en: "Onboard", es: "A bordo" },
    leave: { pt: "Em licença", en: "On leave", es: "De licencia" },
  },

  ai: {
    title: { pt: "Assistente IA", en: "AI Assistant", es: "Asistente IA" },
    thinking: { pt: "Pensando...", en: "Thinking...", es: "Pensando..." },
    processing: { pt: "Processando...", en: "Processing...", es: "Procesando..." },
    suggestion: { pt: "Sugestão", en: "Suggestion", es: "Sugerencia" },
    prediction: { pt: "Previsão", en: "Prediction", es: "Predicción" },
    analysis: { pt: "Análise", en: "Analysis", es: "Análisis" },
    ask_question: { pt: "Faça uma pergunta...", en: "Ask a question...", es: "Haz una pregunta..." },
    offline_mode: { pt: "Modo offline - usando IA local", en: "Offline mode - using local AI", es: "Modo sin conexión - usando IA local" },
  },

  sync: {
    title: { pt: "Sincronização", en: "Synchronization", es: "Sincronización" },
    sync_now: { pt: "Sincronizar agora", en: "Sync now", es: "Sincronizar ahora" },
    last_sync: { pt: "Última sincronização", en: "Last sync", es: "Última sincronización" },
    pending_items: { pt: "Itens pendentes", en: "Pending items", es: "Elementos pendientes" },
    conflict: { pt: "Conflito", en: "Conflict", es: "Conflicto" },
    resolve: { pt: "Resolver", en: "Resolve", es: "Resolver" },
    keep_local: { pt: "Manter local", en: "Keep local", es: "Mantener local" },
    keep_server: { pt: "Manter servidor", en: "Keep server", es: "Mantener servidor" },
  },

  errors: {
    generic: { pt: "Ocorreu um erro. Tente novamente.", en: "An error occurred. Please try again.", es: "Ocurrió un error. Inténtalo de nuevo." },
    network: { pt: "Erro de conexão. Verifique sua internet.", en: "Connection error. Check your internet.", es: "Error de conexión. Verifica tu internet." },
    auth: { pt: "Sessão expirada. Faça login novamente.", en: "Session expired. Please login again.", es: "Sesión expirada. Inicia sesión nuevamente." },
    permission: { pt: "Você não tem permissão para esta ação.", en: "You do not have permission for this action.", es: "No tienes permiso para esta acción." },
    not_found: { pt: "Recurso não encontrado.", en: "Resource not found.", es: "Recurso no encontrado." },
    validation: { pt: "Verifique os dados informados.", en: "Please check the provided data.", es: "Verifica los datos proporcionados." },
  },

  messages: {
    saved: { pt: "Salvo com sucesso!", en: "Saved successfully!", es: "¡Guardado exitosamente!" },
    deleted: { pt: "Excluído com sucesso!", en: "Deleted successfully!", es: "¡Eliminado exitosamente!" },
    synced: { pt: "Sincronizado com sucesso!", en: "Synced successfully!", es: "¡Sincronizado exitosamente!" },
    offline_saved: { pt: "Salvo localmente. Será sincronizado quando online.", en: "Saved locally. Will sync when online.", es: "Guardado localmente. Se sincronizará cuando esté en línea." },
    confirm_delete: { pt: "Tem certeza que deseja excluir?", en: "Are you sure you want to delete?", es: "¿Estás seguro de que quieres eliminar?" },
    unsaved_changes: { pt: "Você tem alterações não salvas.", en: "You have unsaved changes.", es: "Tienes cambios sin guardar." },
  },
};

const STORAGE_KEY = "nautilus_language";

class MultilingualSystem {
  private currentLanguage: SupportedLanguage = "pt";
  private customTranslations: Record<string, TranslationNamespace> = {};
  private listeners: ((lang: SupportedLanguage) => void)[] = [];

  constructor() {
    this.loadLanguage();
  }

  /**
   * Load language preference from storage
   */
  private loadLanguage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ["pt", "en", "es"].includes(stored)) {
        this.currentLanguage = stored as SupportedLanguage;
      } else {
        // Auto-detect from browser
        const browserLang = navigator.language.split("-")[0];
        if (["pt", "en", "es"].includes(browserLang)) {
          this.currentLanguage = browserLang as SupportedLanguage;
        }
      }
    } catch {
      this.currentLanguage = "pt";
    }
  }

  /**
   * Save language preference
   */
  private saveLanguage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, this.currentLanguage);
    } catch (error) {
      console.warn("Failed to save language preference:", error);
      console.warn("Failed to save language preference:", error);
    }
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  setLanguage(lang: SupportedLanguage): void {
    if (!["pt", "en", "es"].includes(lang)) {
      return;
    }

    this.currentLanguage = lang;
    this.saveLanguage();
    this.listeners.forEach(listener => listener(lang));
  }

  /**
   * Subscribe to language changes
   */
  onLanguageChange(callback: (lang: SupportedLanguage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Translate a key
   */
  t(key: string, fallback?: string): string {
    const parts = key.split(".");
    let current: any = { ...TRANSLATIONS, ...this.customTranslations };

    for (const part of parts) {
      if (current[part] === undefined) {
        return fallback || key;
      }
      current = current[part];
    }

    if (typeof current === "object" && current[this.currentLanguage]) {
      return current[this.currentLanguage];
    }

    return fallback || current.pt || key;
  }

  /**
   * Translate with variables
   */
  tv(key: string, variables: Record<string, string | number>, fallback?: string): string {
    let text = this.t(key, fallback);
    
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`{{${varKey}}}`, "g"), String(value));
    });

    return text;
  }

  /**
   * Add custom translations
   */
  addTranslations(namespace: string, translations: TranslationNamespace): void {
    this.customTranslations[namespace] = {
      ...(this.customTranslations[namespace] || {}),
      ...translations
    };
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): { code: SupportedLanguage; name: string; nativeName: string }[] {
    return [
      { code: "pt", name: "Portuguese", nativeName: "Português" },
      { code: "en", name: "English", nativeName: "English" },
      { code: "es", name: "Spanish", nativeName: "Español" }
    ];
  }

  /**
   * Get language name
   */
  getLanguageName(code: SupportedLanguage): string {
    const lang = this.getSupportedLanguages().find(l => l.code === code);
    return lang?.nativeName || code;
  }

  /**
   * Format date according to language
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locales: Record<SupportedLanguage, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES"
    };

    return new Intl.DateTimeFormat(locales[this.currentLanguage], options).format(date);
  }

  /**
   * Format number according to language
   */
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    const locales: Record<SupportedLanguage, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES"
    };

    return new Intl.NumberFormat(locales[this.currentLanguage], options).format(num);
  }

  /**
   * Format currency according to language
   */
  formatCurrency(amount: number, currency: string = "BRL"): string {
    return this.formatNumber(amount, {
      style: "currency",
      currency
    });
  }

  /**
   * Export translations for backup
   */
  exportTranslations(): string {
    return JSON.stringify({
      builtIn: TRANSLATIONS,
      custom: this.customTranslations
    }, null, 2);
  }

  /**
   * Import custom translations
   */
  importTranslations(data: Record<string, TranslationNamespace>): void {
    Object.entries(data).forEach(([namespace, translations]) => {
      this.addTranslations(namespace, translations);
    });
  }
}

export const i18n = new MultilingualSystem();

// Shorthand function
export const t = (key: string, fallback?: string) => i18n.t(key, fallback);
export const tv = (key: string, variables: Record<string, string | number>, fallback?: string) => 
  i18n.tv(key, variables, fallback);
