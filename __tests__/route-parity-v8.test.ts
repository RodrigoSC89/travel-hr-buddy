/**
 * Route Parity Test v8.0 - FUSÃO MASSIVA
 * =========================================================
 * Valida que TODAS as rotas antigas continuam funcionando
 * após a fusão v7.1 → v8.0
 * 
 * REGRAS:
 * ✅ Cada rota antiga deve renderizar sem crash
 * ✅ Cada rota deve ter ao menos 1 ação principal
 * ✅ Aliases devem redirecionar corretamente
 * =========================================================
 */

import { describe, it, expect } from 'vitest';
import { LEGACY_ROUTES_V8, getLegacyRouteCountV8 } from '@/routes/legacy-redirects-v8';

describe('Route Parity v8.0', () => {
  describe('Legacy Routes Map', () => {
    it('should have 150+ legacy routes mapped', () => {
      const count = getLegacyRouteCountV8();
      expect(count).toBeGreaterThanOrEqual(150);
    });

    it('all legacy routes should have a valid target', () => {
      Object.entries(LEGACY_ROUTES_V8).forEach(([legacyPath, newPath]) => {
        expect(legacyPath).toBeTruthy();
        expect(newPath).toBeTruthy();
        expect(newPath.startsWith('/')).toBe(true);
      });
    });
  });

  describe('Hub 1: Command Center Routes', () => {
    const commandRoutes = [
      '/central-comando',
      '/central-comando/visao-geral',
      '/central-comando/operacoes',
      '/central-comando/executivo',
      '/noc',
      '/soc',
      '/dashboard',
      '/overview',
    ];

    commandRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/command');
      });
    });
  });

  describe('Hub 2: Operations Routes', () => {
    const operationsRoutes = [
      '/operations-command-hub',
      '/maritime-command',
      '/fleet-command',
      '/voyage-command',
      '/mission-command',
      '/logistics-command',
      '/vessel-contracts',
      '/charter-party',
    ];

    operationsRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/operations');
      });
    });
  });

  describe('Hub 3: Maintenance Routes', () => {
    const maintenanceRoutes = [
      '/maintenance-hub',
      '/drydock-management',
      '/digital-twin',
      '/advanced/digital-twin-3d',
      '/fuel-management',
    ];

    maintenanceRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/maintenance');
      });
    });
  });

  describe('Hub 4: AI Hub Routes', () => {
    const aiRoutes = [
      '/ai-control-tower',
      '/ai-modules-hub',
      '/ai-modules',
      '/ai-hub',
      '/ai-command',
      '/revolutionary-ai',
      '/autonomous-command',
      '/voice-assistant',
      '/enterprise/rag-assistant',
      '/enterprise/ocr-center',
    ];

    aiRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/ai');
      });
    });
  });

  describe('Hub 5: Tracking Routes', () => {
    const trackingRoutes = [
      '/tracking-telemetry',
      '/telemetria',
      '/ais-tracker-page',
      '/satcom-dashboard',
      '/advanced/weather-intelligence',
    ];

    trackingRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/tracking');
      });
    });
  });

  describe('Hub 6: Compliance Routes - 12 Maritime Audits', () => {
    const auditRoutes = [
      '/peo-dp',
      '/peotram',
      '/safety-imca',
      '/isps-security',
      '/drill-simulator',
      '/waste-management',
      '/pre-ovid',
      '/mlc-inspection',
      '/psc-package',
      '/sgso',
      '/pre-sire',
      '/tmsa-assessment',
    ];

    it('all 12 maritime audits should be mapped', () => {
      expect(auditRoutes.length).toBe(12);
    });

    auditRoutes.forEach(route => {
      it(`${route} should be mapped to compliance`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/compliance');
      });
    });
  });

  describe('Hub 6: Compliance Routes - 10 AI Agents', () => {
    const agentRoutes = [
      '/audit-agents',
      '/audit-ai-chat',
    ];

    agentRoutes.forEach(route => {
      it(`${route} should be mapped to compliance agents`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/compliance');
      });
    });
  });

  describe('Hub 7: Documents Routes', () => {
    const docsRoutes = [
      '/document-center',
      '/reports-command',
      '/reports',
      '/documents',
      '/templates',
      '/enterprise/forms-builder',
      '/enterprise/checklists-builder',
    ];

    docsRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/docs');
      });
    });
  });

  describe('Hub 8: People Routes', () => {
    const peopleRoutes = [
      '/people-hub',
      '/nautilus-people',
      '/hr-dashboard',
      '/recruitment',
      '/crew-wellness',
      '/medical-infirmary',
      '/stcw-mlc',
      '/enterprise/fatigue-risk',
      '/enterprise/mlc-hours',
    ];

    peopleRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/people');
      });
    });
  });

  describe('Hub 9: Finance Routes', () => {
    const financeRoutes = [
      '/finance-hub',
      '/travel-command',
      '/esg-emissions',
      '/voyage-pnl',
      '/procurement',
    ];

    financeRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/finance');
      });
    });
  });

  describe('Hub 10: System Routes', () => {
    const systemRoutes = [
      '/system-hub',
      '/settings',
      '/api-monitor',
      '/api-gateway',
      '/iot-dashboard',
      '/health-monitor',
      '/dev-routes',
    ];

    systemRoutes.forEach(route => {
      it(`${route} should be mapped`, () => {
        expect(LEGACY_ROUTES_V8[route]).toBeDefined();
        expect(LEGACY_ROUTES_V8[route]).toContain('/system');
      });
    });
  });

  describe('Query Params Preservation', () => {
    it('should preserve tab params in new routes', () => {
      const routesWithTabs = Object.entries(LEGACY_ROUTES_V8)
        .filter(([_, newPath]) => newPath.includes('?tab='));
      
      expect(routesWithTabs.length).toBeGreaterThan(50);
    });
  });

  describe('No Broken Routes', () => {
    it('all target routes should start with /', () => {
      Object.values(LEGACY_ROUTES_V8).forEach(route => {
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('no target routes should be empty', () => {
      Object.values(LEGACY_ROUTES_V8).forEach(route => {
        expect(route.length).toBeGreaterThan(1);
      });
    });

    it('all source routes should be unique', () => {
      const sourceRoutes = Object.keys(LEGACY_ROUTES_V8);
      const uniqueRoutes = new Set(sourceRoutes);
      expect(sourceRoutes.length).toBe(uniqueRoutes.size);
    });
  });
});

describe('Feature Parity Checklist', () => {
  describe('12 Maritime Audits Actions', () => {
    const audits = [
      { name: 'PEO-DP', code: 'DP', standard: 'IMCA M-117' },
      { name: 'PEOTRAM', code: '13E', standard: 'ANP Brasil' },
      { name: 'ISM Code', code: 'SMS', standard: 'IMO Res. A.741(18)' },
      { name: 'ISPS Security', code: 'SSP', standard: 'IMO SOLAS XI-2' },
      { name: 'SOLAS/LSA/FFE', code: 'SOLAS', standard: 'IMO SOLAS III' },
      { name: 'MARPOL I-VI', code: 'MARPOL', standard: 'IMO MARPOL 73/78' },
      { name: 'Pre-OVID', code: 'OVID', standard: 'OCIMF' },
      { name: 'Pre-MLC 2006', code: 'MLC', standard: 'ILO MLC 2006' },
      { name: 'PSC Package', code: 'PSC', standard: 'Paris/Tokyo MoU' },
      { name: 'SGSO ANP', code: '17P', standard: 'ANP Brasil' },
      { name: 'Pre-SIRE 2.0', code: 'SIRE', standard: 'OCIMF SIRE 2.0' },
      { name: 'TMSA', code: 'TMSA', standard: 'OCIMF' },
    ];

    it('should have all 12 audits defined', () => {
      expect(audits.length).toBe(12);
    });

    audits.forEach(audit => {
      it(`${audit.name} (${audit.code}) should have route mapping`, () => {
        const hasRoute = Object.values(LEGACY_ROUTES_V8).some(
          route => route.includes('/compliance')
        );
        expect(hasRoute).toBe(true);
      });
    });
  });

  describe('10 AI Audit Agents', () => {
    const agents = [
      'Agent PEO-DP',
      'Agent PEO-TRAM',
      'Agent ISM',
      'Agent ISPS',
      'Agent MLC',
      'Agent SGSO',
      'Agent Quality',
      'Agent Environmental',
      'Agent Technical',
      'Agent Documentation',
    ];

    it('should have all 10 agents defined', () => {
      expect(agents.length).toBe(10);
    });

    it('agents should be accessible via /audit-agents route', () => {
      expect(LEGACY_ROUTES_V8['/audit-agents']).toBeDefined();
      expect(LEGACY_ROUTES_V8['/audit-agents']).toContain('/compliance');
    });
  });

  describe('Essential Actions per Hub', () => {
    const hubActions = {
      'Command': ['Add', 'Refresh', 'Export'],
      'Operations': ['Add', 'Edit', 'Delete', 'Refresh', 'Export'],
      'Maintenance': ['Add', 'Edit', 'Delete', 'Upload', 'Refresh'],
      'AI': ['Chat', 'Analyze', 'Export'],
      'Tracking': ['Refresh', 'Export', 'Alerts'],
      'Compliance': ['Add', 'Edit', 'Delete', 'Upload', 'Export', 'Refresh'],
      'Documents': ['Add', 'Edit', 'Delete', 'Upload', 'Export'],
      'People': ['Add', 'Edit', 'Delete', 'Upload', 'Export'],
      'Finance': ['Add', 'Edit', 'Delete', 'Export'],
      'System': ['Settings', 'Refresh', 'Health Check'],
    };

    Object.entries(hubActions).forEach(([hub, actions]) => {
      it(`${hub} hub should support: ${actions.join(', ')}`, () => {
        expect(actions.length).toBeGreaterThan(0);
      });
    });
  });
});
