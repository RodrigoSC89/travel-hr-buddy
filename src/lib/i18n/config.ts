/**
 * i18n Configuration - Internationalization
 * PATCH 850 - Suporte multilíngue
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  fil: { name: 'Filipino', nativeName: 'Filipino', dir: 'ltr' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  ru: { name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Default namespace
export const DEFAULT_NS = 'common';

// Namespaces
export const NAMESPACES = [
  'common',
  'navigation',
  'crew',
  'voyages',
  'maintenance',
  'safety',
  'compliance',
  'reports',
  'settings',
  'emergency',
] as const;

// English translations (base)
const enTranslations = {
  common: {
    appName: 'Nautilus One',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    select: 'Select',
    noData: 'No data available',
    required: 'Required',
    optional: 'Optional',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    description: 'Description',
    type: 'Type',
    category: 'Category',
    priority: 'Priority',
    offline: 'Offline',
    online: 'Online',
    syncing: 'Syncing...',
    lastUpdated: 'Last updated',
  },
  navigation: {
    dashboard: 'Dashboard',
    commandCenter: 'Command Center',
    crew: 'Crew',
    voyages: 'Voyages',
    maintenance: 'Maintenance',
    safety: 'Safety',
    compliance: 'Compliance',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
  },
  crew: {
    title: 'Crew Management',
    members: 'Crew Members',
    addMember: 'Add Member',
    editMember: 'Edit Member',
    deleteMember: 'Delete Member',
    rank: 'Rank',
    department: 'Department',
    certificates: 'Certificates',
    training: 'Training',
    schedule: 'Schedule',
    payroll: 'Payroll',
    health: 'Health Records',
    documents: 'Documents',
    onboard: 'Onboard',
    ashore: 'Ashore',
    signOn: 'Sign On',
    signOff: 'Sign Off',
  },
  voyages: {
    title: 'Voyage Management',
    current: 'Current Voyage',
    planned: 'Planned',
    completed: 'Completed',
    departure: 'Departure',
    arrival: 'Arrival',
    route: 'Route',
    eta: 'ETA',
    etd: 'ETD',
    noonReport: 'Noon Report',
    portCall: 'Port Call',
    weather: 'Weather',
    fuel: 'Fuel',
    cargo: 'Cargo',
  },
  maintenance: {
    title: 'Maintenance',
    workOrders: 'Work Orders',
    equipment: 'Equipment',
    spares: 'Spare Parts',
    pms: 'Planned Maintenance',
    corrective: 'Corrective',
    preventive: 'Preventive',
    predictive: 'Predictive',
    overdue: 'Overdue',
    upcoming: 'Upcoming',
    completed: 'Completed',
  },
  safety: {
    title: 'Safety',
    drills: 'Safety Drills',
    inspections: 'Inspections',
    incidents: 'Incidents',
    nearMisses: 'Near Misses',
    riskAssessment: 'Risk Assessment',
    ppe: 'PPE',
    emergency: 'Emergency',
  },
  emergency: {
    title: 'EMERGENCY MODE',
    subtitle: 'Critical Functions Only',
    sos: 'SOS',
    mayday: 'MAYDAY',
    panpan: 'PAN-PAN',
    mrcc: 'Contact MRCC',
    dpa: 'Contact DPA',
    musterList: 'Muster List',
    headCount: 'Head Count',
    lifeboat: 'Lifeboat Stations',
    fireStations: 'Fire Stations',
    manOverboard: 'Man Overboard',
    abandon: 'Abandon Ship',
    incidentLog: 'Incident Log',
    gpsPosition: 'GPS Position',
    timestamp: 'Timestamp',
    recordIncident: 'Record Incident',
    exitEmergency: 'Exit Emergency Mode',
    confirmExit: 'Are you sure you want to exit emergency mode?',
    activeAlert: 'Active Emergency Alert',
    allHandsSafe: 'All Hands Safe',
    missingPersonnel: 'Missing Personnel',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    timezone: 'Timezone',
    units: 'Units',
    metric: 'Metric',
    imperial: 'Imperial',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    notifications: 'Notifications',
    privacy: 'Privacy',
    security: 'Security',
  },
};

// Portuguese translations
const ptTranslations = {
  common: {
    appName: 'Nautilus One',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    import: 'Importar',
    refresh: 'Atualizar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    confirm: 'Confirmar',
    close: 'Fechar',
    yes: 'Sim',
    no: 'Não',
    all: 'Todos',
    none: 'Nenhum',
    select: 'Selecionar',
    noData: 'Nenhum dado disponível',
    required: 'Obrigatório',
    optional: 'Opcional',
    actions: 'Ações',
    status: 'Status',
    date: 'Data',
    time: 'Hora',
    name: 'Nome',
    description: 'Descrição',
    type: 'Tipo',
    category: 'Categoria',
    priority: 'Prioridade',
    offline: 'Offline',
    online: 'Online',
    syncing: 'Sincronizando...',
    lastUpdated: 'Última atualização',
  },
  navigation: {
    dashboard: 'Painel',
    commandCenter: 'Centro de Comando',
    crew: 'Tripulação',
    voyages: 'Viagens',
    maintenance: 'Manutenção',
    safety: 'Segurança',
    compliance: 'Conformidade',
    reports: 'Relatórios',
    settings: 'Configurações',
    profile: 'Perfil',
    logout: 'Sair',
  },
  crew: {
    title: 'Gestão de Tripulação',
    members: 'Membros da Tripulação',
    addMember: 'Adicionar Membro',
    editMember: 'Editar Membro',
    deleteMember: 'Excluir Membro',
    rank: 'Posto',
    department: 'Departamento',
    certificates: 'Certificados',
    training: 'Treinamento',
    schedule: 'Escala',
    payroll: 'Folha de Pagamento',
    health: 'Registros de Saúde',
    documents: 'Documentos',
    onboard: 'A Bordo',
    ashore: 'Em Terra',
    signOn: 'Embarque',
    signOff: 'Desembarque',
  },
  emergency: {
    title: 'MODO EMERGÊNCIA',
    subtitle: 'Apenas Funções Críticas',
    sos: 'SOS',
    mayday: 'MAYDAY',
    panpan: 'PAN-PAN',
    mrcc: 'Contatar MRCC',
    dpa: 'Contatar DPA',
    musterList: 'Lista de Chamada',
    headCount: 'Contagem de Pessoas',
    lifeboat: 'Estações de Baleeira',
    fireStations: 'Estações de Incêndio',
    manOverboard: 'Homem ao Mar',
    abandon: 'Abandonar Navio',
    incidentLog: 'Registro de Incidente',
    gpsPosition: 'Posição GPS',
    timestamp: 'Data/Hora',
    recordIncident: 'Registrar Incidente',
    exitEmergency: 'Sair do Modo Emergência',
    confirmExit: 'Tem certeza que deseja sair do modo emergência?',
    activeAlert: 'Alerta de Emergência Ativo',
    allHandsSafe: 'Todos em Segurança',
    missingPersonnel: 'Pessoal Desaparecido',
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
      pt: ptTranslations,
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: DEFAULT_NS,
    ns: NAMESPACES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

/**
 * Get current language direction
 */
export function getLanguageDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
  return SUPPORTED_LANGUAGES[lang]?.dir || 'ltr';
}

/**
 * Check if language is RTL
 */
export function isRTL(lang: SupportedLanguage): boolean {
  return getLanguageDirection(lang) === 'rtl';
}

/**
 * Get browser preferred language
 */
export function getBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang in SUPPORTED_LANGUAGES) 
    ? browserLang as SupportedLanguage 
    : 'en';
}
