/**
 * PATCH 839: Internationalization System
 * Multi-language support for global maritime operations
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'zh-CN';

interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

interface I18nConfig {
  defaultLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  languages: SupportedLanguage[];
}

const DEFAULT_CONFIG: I18nConfig = {
  defaultLanguage: 'pt-BR',
  fallbackLanguage: 'en-US',
  languages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'zh-CN'],
};

// Core translations
const translations: Record<SupportedLanguage, TranslationDictionary> = {
  'pt-BR': {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Atenção',
      confirm: 'Confirmar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      open: 'Abrir',
      yes: 'Sim',
      no: 'Não',
      all: 'Todos',
      none: 'Nenhum',
      select: 'Selecionar',
      upload: 'Enviar',
      download: 'Baixar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Atualizar',
      settings: 'Configurações',
      profile: 'Perfil',
      logout: 'Sair',
      login: 'Entrar',
    },
    navigation: {
      dashboard: 'Painel',
      vessels: 'Embarcações',
      crew: 'Tripulação',
      maintenance: 'Manutenção',
      compliance: 'Conformidade',
      reports: 'Relatórios',
      analytics: 'Análises',
      settings: 'Configurações',
    },
    crew: {
      title: 'Gestão de Tripulação',
      addMember: 'Adicionar Tripulante',
      name: 'Nome',
      rank: 'Posto',
      department: 'Departamento',
      status: 'Status',
      certificates: 'Certificados',
      experience: 'Experiência',
      onboard: 'A bordo',
      offboard: 'Em terra',
    },
    vessel: {
      title: 'Gestão de Embarcações',
      name: 'Nome',
      type: 'Tipo',
      flag: 'Bandeira',
      imo: 'Número IMO',
      status: 'Status',
      location: 'Localização',
      captain: 'Comandante',
    },
    maintenance: {
      title: 'Manutenção',
      scheduled: 'Agendada',
      inProgress: 'Em andamento',
      completed: 'Concluída',
      overdue: 'Atrasada',
      equipment: 'Equipamento',
      dueDate: 'Data prevista',
      assignedTo: 'Responsável',
    },
    errors: {
      networkError: 'Erro de conexão. Verifique sua internet.',
      serverError: 'Erro no servidor. Tente novamente.',
      notFound: 'Não encontrado.',
      unauthorized: 'Acesso não autorizado.',
      validationError: 'Dados inválidos.',
    },
    time: {
      now: 'Agora',
      today: 'Hoje',
      yesterday: 'Ontem',
      tomorrow: 'Amanhã',
      thisWeek: 'Esta semana',
      thisMonth: 'Este mês',
      thisYear: 'Este ano',
    },
  },
  'en-US': {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      select: 'Select',
      upload: 'Upload',
      download: 'Download',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
    },
    navigation: {
      dashboard: 'Dashboard',
      vessels: 'Vessels',
      crew: 'Crew',
      maintenance: 'Maintenance',
      compliance: 'Compliance',
      reports: 'Reports',
      analytics: 'Analytics',
      settings: 'Settings',
    },
    crew: {
      title: 'Crew Management',
      addMember: 'Add Crew Member',
      name: 'Name',
      rank: 'Rank',
      department: 'Department',
      status: 'Status',
      certificates: 'Certificates',
      experience: 'Experience',
      onboard: 'On board',
      offboard: 'Ashore',
    },
    vessel: {
      title: 'Vessel Management',
      name: 'Name',
      type: 'Type',
      flag: 'Flag',
      imo: 'IMO Number',
      status: 'Status',
      location: 'Location',
      captain: 'Captain',
    },
    maintenance: {
      title: 'Maintenance',
      scheduled: 'Scheduled',
      inProgress: 'In Progress',
      completed: 'Completed',
      overdue: 'Overdue',
      equipment: 'Equipment',
      dueDate: 'Due Date',
      assignedTo: 'Assigned To',
    },
    errors: {
      networkError: 'Network error. Check your connection.',
      serverError: 'Server error. Please try again.',
      notFound: 'Not found.',
      unauthorized: 'Unauthorized access.',
      validationError: 'Invalid data.',
    },
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      thisMonth: 'This month',
      thisYear: 'This year',
    },
  },
  'es-ES': {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      filter: 'Filtrar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      confirm: 'Confirmar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      open: 'Abrir',
      yes: 'Sí',
      no: 'No',
      all: 'Todos',
      none: 'Ninguno',
      select: 'Seleccionar',
      upload: 'Subir',
      download: 'Descargar',
      export: 'Exportar',
      import: 'Importar',
      refresh: 'Actualizar',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Salir',
      login: 'Entrar',
    },
    navigation: {
      dashboard: 'Panel',
      vessels: 'Embarcaciones',
      crew: 'Tripulación',
      maintenance: 'Mantenimiento',
      compliance: 'Cumplimiento',
      reports: 'Informes',
      analytics: 'Análisis',
      settings: 'Configuración',
    },
    crew: {
      title: 'Gestión de Tripulación',
      addMember: 'Añadir Tripulante',
      name: 'Nombre',
      rank: 'Rango',
      department: 'Departamento',
      status: 'Estado',
      certificates: 'Certificados',
      experience: 'Experiencia',
      onboard: 'A bordo',
      offboard: 'En tierra',
    },
    vessel: {
      title: 'Gestión de Embarcaciones',
      name: 'Nombre',
      type: 'Tipo',
      flag: 'Bandera',
      imo: 'Número IMO',
      status: 'Estado',
      location: 'Ubicación',
      captain: 'Capitán',
    },
    maintenance: {
      title: 'Mantenimiento',
      scheduled: 'Programado',
      inProgress: 'En progreso',
      completed: 'Completado',
      overdue: 'Atrasado',
      equipment: 'Equipo',
      dueDate: 'Fecha prevista',
      assignedTo: 'Asignado a',
    },
    errors: {
      networkError: 'Error de conexión. Verifica tu internet.',
      serverError: 'Error del servidor. Inténtalo de nuevo.',
      notFound: 'No encontrado.',
      unauthorized: 'Acceso no autorizado.',
      validationError: 'Datos inválidos.',
    },
    time: {
      now: 'Ahora',
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      thisWeek: 'Esta semana',
      thisMonth: 'Este mes',
      thisYear: 'Este año',
    },
  },
  'fr-FR': {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      filter: 'Filtrer',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Attention',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer',
      open: 'Ouvrir',
      yes: 'Oui',
      no: 'Non',
      all: 'Tous',
      none: 'Aucun',
      select: 'Sélectionner',
      upload: 'Télécharger',
      download: 'Télécharger',
      export: 'Exporter',
      import: 'Importer',
      refresh: 'Actualiser',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
      login: 'Connexion',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      vessels: 'Navires',
      crew: 'Équipage',
      maintenance: 'Maintenance',
      compliance: 'Conformité',
      reports: 'Rapports',
      analytics: 'Analyses',
      settings: 'Paramètres',
    },
    crew: {
      title: 'Gestion de l\'équipage',
      addMember: 'Ajouter un membre',
      name: 'Nom',
      rank: 'Grade',
      department: 'Département',
      status: 'Statut',
      certificates: 'Certificats',
      experience: 'Expérience',
      onboard: 'À bord',
      offboard: 'À terre',
    },
    vessel: {
      title: 'Gestion des navires',
      name: 'Nom',
      type: 'Type',
      flag: 'Pavillon',
      imo: 'Numéro IMO',
      status: 'Statut',
      location: 'Position',
      captain: 'Capitaine',
    },
    maintenance: {
      title: 'Maintenance',
      scheduled: 'Planifiée',
      inProgress: 'En cours',
      completed: 'Terminée',
      overdue: 'En retard',
      equipment: 'Équipement',
      dueDate: 'Date prévue',
      assignedTo: 'Assigné à',
    },
    errors: {
      networkError: 'Erreur réseau. Vérifiez votre connexion.',
      serverError: 'Erreur serveur. Réessayez.',
      notFound: 'Non trouvé.',
      unauthorized: 'Accès non autorisé.',
      validationError: 'Données invalides.',
    },
    time: {
      now: 'Maintenant',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      tomorrow: 'Demain',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      thisYear: 'Cette année',
    },
  },
  'zh-CN': {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      filter: '筛选',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      open: '打开',
      yes: '是',
      no: '否',
      all: '全部',
      none: '无',
      select: '选择',
      upload: '上传',
      download: '下载',
      export: '导出',
      import: '导入',
      refresh: '刷新',
      settings: '设置',
      profile: '个人资料',
      logout: '登出',
      login: '登录',
    },
    navigation: {
      dashboard: '仪表板',
      vessels: '船舶',
      crew: '船员',
      maintenance: '维护',
      compliance: '合规',
      reports: '报告',
      analytics: '分析',
      settings: '设置',
    },
    crew: {
      title: '船员管理',
      addMember: '添加船员',
      name: '姓名',
      rank: '职级',
      department: '部门',
      status: '状态',
      certificates: '证书',
      experience: '经验',
      onboard: '在船',
      offboard: '在岸',
    },
    vessel: {
      title: '船舶管理',
      name: '名称',
      type: '类型',
      flag: '旗帜',
      imo: 'IMO编号',
      status: '状态',
      location: '位置',
      captain: '船长',
    },
    maintenance: {
      title: '维护',
      scheduled: '已计划',
      inProgress: '进行中',
      completed: '已完成',
      overdue: '逾期',
      equipment: '设备',
      dueDate: '截止日期',
      assignedTo: '负责人',
    },
    errors: {
      networkError: '网络错误，请检查连接。',
      serverError: '服务器错误，请重试。',
      notFound: '未找到。',
      unauthorized: '未授权访问。',
      validationError: '数据无效。',
    },
    time: {
      now: '现在',
      today: '今天',
      yesterday: '昨天',
      tomorrow: '明天',
      thisWeek: '本周',
      thisMonth: '本月',
      thisYear: '今年',
    },
  },
};

class TranslationManager {
  private config: I18nConfig;
  private currentLanguage: SupportedLanguage;
  private listeners: Set<(lang: SupportedLanguage) => void> = new Set();

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentLanguage = this.detectLanguage();
  }

  private detectLanguage(): SupportedLanguage {
    // Check localStorage
    const saved = localStorage.getItem('language') as SupportedLanguage;
    if (saved && this.config.languages.includes(saved)) {
      return saved;
    }

    // Check browser language
    const browserLang = navigator.language;
    const match = this.config.languages.find(
      lang => lang === browserLang || lang.split('-')[0] === browserLang.split('-')[0]
    );

    return match || this.config.defaultLanguage;
  }

  // Get translation by key path (e.g., "common.save")
  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Try fallback language
        value = translations[this.config.fallbackLanguage];
        for (const fallbackKey of keys) {
          value = value?.[fallbackKey];
          if (value === undefined) break;
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation not found: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
        value
      );
    }

    return value;
  }

  // Get current language
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  // Set language
  setLanguage(lang: SupportedLanguage): void {
    if (!this.config.languages.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    this.notifyListeners();
  }

  // Get all available languages
  getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string }> {
    const names: Record<SupportedLanguage, string> = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (US)',
      'es-ES': 'Español',
      'fr-FR': 'Français',
      'zh-CN': '中文 (简体)',
    };

    return this.config.languages.map(code => ({
      code,
      name: names[code],
    }));
  }

  // Subscribe to language changes
  subscribe(callback: (lang: SupportedLanguage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.currentLanguage));
  }
}

export const i18n = new TranslationManager();

// React hook
export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return i18n.t(key, params);
  }, [language]);

  const changeLanguage = useCallback((lang: SupportedLanguage) => {
    i18n.setLanguage(lang);
  }, []);

  return {
    t,
    language,
    changeLanguage,
    languages: i18n.getAvailableLanguages(),
  };
}

// Context for provider pattern
interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => void;
  languages: Array<{ code: SupportedLanguage; name: string }>;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
