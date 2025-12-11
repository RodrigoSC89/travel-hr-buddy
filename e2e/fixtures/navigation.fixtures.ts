/**
 * Navigation Test Fixtures - FASE 3
 * Rotas e elementos de navegação para testes
 */

export const mainRoutes = {
  home: '/',
  dashboard: '/dashboard',
  login: '/auth/login',
  admin: '/admin',
  settings: '/settings'
};

export const moduleRoutes = {
  // ESG & Emissões
  esg: '/esg-dashboard',
  emissions: '/emissions',
  
  // Auditorias
  ismAudit: '/ism-audit',
  audits: '/audits',
  auditHistory: '/audit-history',
  
  // Manutenção
  maintenance: '/maintenance',
  maintenanceOrders: '/maintenance/orders',
  maintenanceSchedule: '/maintenance/schedule',
  
  // Tripulação
  crew: '/crew',
  crewManagement: '/crew-management',
  crewWellbeing: '/crew/wellbeing',
  
  // Documentos
  documents: '/documents',
  documentHub: '/document-hub',
  
  // Outros
  reports: '/reports',
  analytics: '/analytics',
  notifications: '/notifications'
};

export const breadcrumbPaths = [
  { route: '/dashboard', breadcrumb: ['Home', 'Dashboard'] },
  { route: '/esg-dashboard', breadcrumb: ['Home', 'ESG', 'Dashboard'] },
  { route: '/ism-audit', breadcrumb: ['Home', 'Auditorias', 'ISM'] },
  { route: '/crew-management', breadcrumb: ['Home', 'Tripulação', 'Gestão'] },
  { route: '/maintenance/orders', breadcrumb: ['Home', 'Manutenção', 'Ordens'] }
];

export const menuItems = [
  { label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'ESG', route: '/esg-dashboard', icon: 'Leaf' },
  { label: 'Auditorias', route: '/audits', icon: 'ClipboardCheck' },
  { label: 'Manutenção', route: '/maintenance', icon: 'Wrench' },
  { label: 'Tripulação', route: '/crew', icon: 'Users' },
  { label: 'Documentos', route: '/documents', icon: 'FileText' },
  { label: 'Relatórios', route: '/reports', icon: 'BarChart' },
  { label: 'Configurações', route: '/settings', icon: 'Settings' }
];
