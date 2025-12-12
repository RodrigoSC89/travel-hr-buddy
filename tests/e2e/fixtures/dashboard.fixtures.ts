/**
 * Dashboard Test Fixtures
 * FASE B.4 - Testes para Dashboards Consolidados
 */

export const dashboardFixtures = {
  executive: {
    route: '/executive-dashboard',
    kpis: [
      { id: 'total-vessels', label: 'Total Vessels', value: 25 },
      { id: 'crew-count', label: 'Crew Members', value: 450 },
      { id: 'compliance-rate', label: 'Compliance Rate', value: 98 },
    ],
    widgets: [
      { id: 'kpi-widget', type: 'kpi', visible: true },
      { id: 'chart-widget', type: 'chart', visible: true },
      { id: 'table-widget', type: 'table', visible: true },
    ],
    filters: [
      { id: 'time-range', label: 'Time Range', options: ['7d', '30d', '90d'] },
      { id: 'vessel-type', label: 'Vessel Type', options: ['All', 'Cargo', 'Tanker'] },
    ],
  },
  analytics: {
    route: '/analytics-dashboard',
    timeRanges: ['7d', '30d', '90d', '1y'],
    categories: ['all', 'operations', 'crew', 'maintenance', 'compliance'],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    realTimeUpdate: true,
    charts: [
      { id: 'trend-chart', type: 'line', title: 'Performance Trend' },
      { id: 'distribution-chart', type: 'bar', title: 'Distribution' },
      { id: 'comparison-chart', type: 'pie', title: 'Comparison' },
    ],
  },
};

export const dashboardTestData = {
  validConfig: {
    id: 'test-dashboard',
    title: 'Test Dashboard',
    dataSource: 'api/test-data',
    refreshInterval: 30000,
    filters: [],
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
    ],
  },
  mockData: {
    kpis: [
      { id: '1', label: 'Test KPI', value: 100, trend: 'up' },
    ],
    charts: [
      { id: '1', type: 'line', data: [1, 2, 3, 4, 5] },
    ],
  },
};

export const dashboardSelectors = {
  executive: {
    container: '[data-testid="executive-dashboard"]',
    kpiCards: '[data-testid="kpi-card"]',
    chartWidgets: '[data-testid="chart-widget"]',
    tableWidgets: '[data-testid="table-widget"]',
    refreshButton: '[data-testid="refresh-button"]',
    exportButton: '[data-testid="export-button"]',
    filterPanel: '[data-testid="filter-panel"]',
    tabs: '[role="tablist"]',
  },
  analytics: {
    container: '[data-testid="analytics-dashboard"]',
    timeRangeSelect: '[data-testid="time-range-select"]',
    categorySelect: '[data-testid="category-select"]',
    exportMenu: '[data-testid="export-menu"]',
    drillDownButton: '[data-testid="drill-down-button"]',
    realTimeIndicator: '[data-testid="real-time-indicator"]',
  },
};
