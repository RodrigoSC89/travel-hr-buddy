/**
 * i18n Configuration - PROMPT 15
 * Multi-language support setup
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.fleet": "Fleet",
      "nav.crew": "Crew",
      "nav.maintenance": "Maintenance",
      "nav.compliance": "Compliance",
      "nav.finance": "Finance",
      "nav.reports": "Reports",
      "nav.settings": "Settings",
      
      // Common actions
      "action.save": "Save",
      "action.cancel": "Cancel",
      "action.delete": "Delete",
      "action.edit": "Edit",
      "action.create": "Create",
      "action.search": "Search",
      "action.filter": "Filter",
      "action.export": "Export",
      "action.import": "Import",
      "action.refresh": "Refresh",
      
      // Status
      "status.active": "Active",
      "status.inactive": "Inactive",
      "status.pending": "Pending",
      "status.completed": "Completed",
      "status.error": "Error",
      "status.loading": "Loading...",
      
      // Messages
      "message.success": "Operation completed successfully",
      "message.error": "An error occurred",
      "message.confirm_delete": "Are you sure you want to delete this item?",
      "message.no_data": "No data available",
      "message.loading": "Loading data...",
      
      // Dashboard
      "dashboard.welcome": "Welcome to Nautilus One",
      "dashboard.overview": "Overview",
      "dashboard.fleet_status": "Fleet Status",
      "dashboard.crew_status": "Crew Status",
      "dashboard.compliance_status": "Compliance Status",
      
      // Fleet
      "fleet.vessels": "Vessels",
      "fleet.vessel_name": "Vessel Name",
      "fleet.imo_number": "IMO Number",
      "fleet.flag": "Flag",
      "fleet.type": "Type",
      "fleet.status": "Status",
      "fleet.position": "Position",
      "fleet.speed": "Speed",
      "fleet.heading": "Heading",
      
      // Crew
      "crew.members": "Crew Members",
      "crew.name": "Name",
      "crew.rank": "Rank",
      "crew.nationality": "Nationality",
      "crew.certificates": "Certificates",
      "crew.contract_end": "Contract End",
      
      // Maintenance
      "maintenance.schedule": "Maintenance Schedule",
      "maintenance.work_orders": "Work Orders",
      "maintenance.equipment": "Equipment",
      "maintenance.due_date": "Due Date",
      "maintenance.priority": "Priority",
      
      // Compliance
      "compliance.audits": "Audits",
      "compliance.certificates": "Certificates",
      "compliance.inspections": "Inspections",
      "compliance.expiry_date": "Expiry Date",
      "compliance.issuing_authority": "Issuing Authority",
      
      // Finance
      "finance.budget": "Budget",
      "finance.expenses": "Expenses",
      "finance.invoices": "Invoices",
      "finance.payroll": "Payroll",
      
      // Time
      "time.today": "Today",
      "time.yesterday": "Yesterday",
      "time.this_week": "This Week",
      "time.this_month": "This Month",
      "time.this_year": "This Year",
    }
  },
  pt: {
    translation: {
      // Navigation
      "nav.dashboard": "Painel",
      "nav.fleet": "Frota",
      "nav.crew": "Tripulação",
      "nav.maintenance": "Manutenção",
      "nav.compliance": "Compliance",
      "nav.finance": "Financeiro",
      "nav.reports": "Relatórios",
      "nav.settings": "Configurações",
      
      // Common actions
      "action.save": "Salvar",
      "action.cancel": "Cancelar",
      "action.delete": "Excluir",
      "action.edit": "Editar",
      "action.create": "Criar",
      "action.search": "Buscar",
      "action.filter": "Filtrar",
      "action.export": "Exportar",
      "action.import": "Importar",
      "action.refresh": "Atualizar",
      
      // Status
      "status.active": "Ativo",
      "status.inactive": "Inativo",
      "status.pending": "Pendente",
      "status.completed": "Concluído",
      "status.error": "Erro",
      "status.loading": "Carregando...",
      
      // Messages
      "message.success": "Operação realizada com sucesso",
      "message.error": "Ocorreu um erro",
      "message.confirm_delete": "Tem certeza que deseja excluir este item?",
      "message.no_data": "Nenhum dado disponível",
      "message.loading": "Carregando dados...",
      
      // Dashboard
      "dashboard.welcome": "Bem-vindo ao Nautilus One",
      "dashboard.overview": "Visão Geral",
      "dashboard.fleet_status": "Status da Frota",
      "dashboard.crew_status": "Status da Tripulação",
      "dashboard.compliance_status": "Status de Compliance",
      
      // Fleet
      "fleet.vessels": "Embarcações",
      "fleet.vessel_name": "Nome da Embarcação",
      "fleet.imo_number": "Número IMO",
      "fleet.flag": "Bandeira",
      "fleet.type": "Tipo",
      "fleet.status": "Status",
      "fleet.position": "Posição",
      "fleet.speed": "Velocidade",
      "fleet.heading": "Rumo",
      
      // Crew
      "crew.members": "Tripulantes",
      "crew.name": "Nome",
      "crew.rank": "Posto",
      "crew.nationality": "Nacionalidade",
      "crew.certificates": "Certificados",
      "crew.contract_end": "Fim do Contrato",
      
      // Maintenance
      "maintenance.schedule": "Agenda de Manutenção",
      "maintenance.work_orders": "Ordens de Serviço",
      "maintenance.equipment": "Equipamentos",
      "maintenance.due_date": "Data Prevista",
      "maintenance.priority": "Prioridade",
      
      // Compliance
      "compliance.audits": "Auditorias",
      "compliance.certificates": "Certificados",
      "compliance.inspections": "Inspeções",
      "compliance.expiry_date": "Data de Validade",
      "compliance.issuing_authority": "Autoridade Emissora",
      
      // Finance
      "finance.budget": "Orçamento",
      "finance.expenses": "Despesas",
      "finance.invoices": "Faturas",
      "finance.payroll": "Folha de Pagamento",
      
      // Time
      "time.today": "Hoje",
      "time.yesterday": "Ontem",
      "time.this_week": "Esta Semana",
      "time.this_month": "Este Mês",
      "time.this_year": "Este Ano",
    }
  },
  es: {
    translation: {
      // Navigation
      "nav.dashboard": "Panel",
      "nav.fleet": "Flota",
      "nav.crew": "Tripulación",
      "nav.maintenance": "Mantenimiento",
      "nav.compliance": "Cumplimiento",
      "nav.finance": "Finanzas",
      "nav.reports": "Informes",
      "nav.settings": "Configuración",
      
      // Common actions
      "action.save": "Guardar",
      "action.cancel": "Cancelar",
      "action.delete": "Eliminar",
      "action.edit": "Editar",
      "action.create": "Crear",
      "action.search": "Buscar",
      "action.filter": "Filtrar",
      "action.export": "Exportar",
      "action.import": "Importar",
      "action.refresh": "Actualizar",
      
      // Status
      "status.active": "Activo",
      "status.inactive": "Inactivo",
      "status.pending": "Pendiente",
      "status.completed": "Completado",
      "status.error": "Error",
      "status.loading": "Cargando...",
      
      // Messages
      "message.success": "Operación completada con éxito",
      "message.error": "Ocurrió un error",
      "message.confirm_delete": "¿Está seguro de que desea eliminar este elemento?",
      "message.no_data": "No hay datos disponibles",
      "message.loading": "Cargando datos...",
    }
  },
  fr: {
    translation: {
      // Navigation
      "nav.dashboard": "Tableau de bord",
      "nav.fleet": "Flotte",
      "nav.crew": "Équipage",
      "nav.maintenance": "Maintenance",
      "nav.compliance": "Conformité",
      "nav.finance": "Finance",
      "nav.reports": "Rapports",
      "nav.settings": "Paramètres",
      
      // Common actions
      "action.save": "Enregistrer",
      "action.cancel": "Annuler",
      "action.delete": "Supprimer",
      "action.edit": "Modifier",
      "action.create": "Créer",
      "action.search": "Rechercher",
    }
  },
  de: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.fleet": "Flotte",
      "nav.crew": "Besatzung",
      "nav.maintenance": "Wartung",
      "nav.compliance": "Compliance",
      "nav.finance": "Finanzen",
      "nav.reports": "Berichte",
      "nav.settings": "Einstellungen",
    }
  },
  zh: {
    translation: {
      // Navigation
      "nav.dashboard": "仪表板",
      "nav.fleet": "船队",
      "nav.crew": "船员",
      "nav.maintenance": "维护",
      "nav.compliance": "合规",
      "nav.finance": "财务",
      "nav.reports": "报告",
      "nav.settings": "设置",
    }
  },
  ja: {
    translation: {
      // Navigation
      "nav.dashboard": "ダッシュボード",
      "nav.fleet": "船隊",
      "nav.crew": "乗組員",
      "nav.maintenance": "メンテナンス",
      "nav.compliance": "コンプライアンス",
      "nav.finance": "財務",
      "nav.reports": "レポート",
      "nav.settings": "設定",
    }
  },
  ar: {
    translation: {
      // Navigation - RTL
      "nav.dashboard": "لوحة القيادة",
      "nav.fleet": "الأسطول",
      "nav.crew": "الطاقم",
      "nav.maintenance": "الصيانة",
      "nav.compliance": "الامتثال",
      "nav.finance": "المالية",
      "nav.reports": "التقارير",
      "nav.settings": "الإعدادات",
    }
  },
  ru: {
    translation: {
      // Navigation
      "nav.dashboard": "Панель управления",
      "nav.fleet": "Флот",
      "nav.crew": "Экипаж",
      "nav.maintenance": "Техобслуживание",
      "nav.compliance": "Соответствие",
      "nav.finance": "Финансы",
      "nav.reports": "Отчёты",
      "nav.settings": "Настройки",
    }
  },
  ko: {
    translation: {
      // Navigation
      "nav.dashboard": "대시보드",
      "nav.fleet": "선대",
      "nav.crew": "선원",
      "nav.maintenance": "유지보수",
      "nav.compliance": "규정준수",
      "nav.finance": "재무",
      "nav.reports": "보고서",
      "nav.settings": "설정",
    }
  }
};

// RTL languages
export const rtlLanguages = ["ar", "he", "fa", "ur"];

// Language display names
export const languageNames: Record<string, string> = {
  en: "English",
  pt: "Português",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
  ru: "Русский",
  ko: "한국어",
};

// Initialize i18n
export const initI18n = () => {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      debug: import.meta.env.DEV,
      interpolation: {
        escapeValue: false, // React already escapes
      },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
      },
    });

  // Update document direction for RTL languages
  i18n.on("languageChanged", (lng) => {
    document.documentElement.dir = rtlLanguages.includes(lng) ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  });

  return i18n;
};

export default i18n;
