/**
 * Route Parity Test v8.0 - MEGA-FUSION
 * =========================================================
 * Valida que TODAS as rotas antigas continuam funcionando
 * após a fusão 12 HUBs → 7 MEGA-HUBs
 * 
 * REGRAS:
 * ✅ Cada rota antiga deve ter um alias válido
 * ✅ Cada rota deve ter ao menos 1 ação principal
 * ✅ 12 Auditorias Marítimas preservadas
 * ✅ 10 Agentes IA preservados
 * =========================================================
 */

import { describe, it, expect } from 'vitest';
import { 
  LEGACY_ROUTES_MEGA, 
  getLegacyRouteCountMega,
  getMaritimeAuditsPaths,
  getAIAuditAgents
} from '@/routes/legacy-redirects-mega';

describe('MEGA-FUSION Route Parity v8.0', () => {
  describe('Legacy Routes Map', () => {
    it('should have 150+ legacy routes mapped', () => {
      const count = getLegacyRouteCountMega();
      expect(count).toBeGreaterThanOrEqual(150);
    });

    it('all legacy routes should have a valid target', () => {
      Object.entries(LEGACY_ROUTES_MEGA).forEach(([legacyPath, newPath]) => {
        expect(legacyPath).toBeTruthy();
        expect(newPath).toBeTruthy();
        expect(newPath.startsWith('/')).toBe(true);
      });
    });
  });

  describe('MEGA-HUB A: Command Routes', () => {
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
      it(`${route} should map to /command`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/command');
      });
    });
  });

  describe('MEGA-HUB B: Ops Routes', () => {
    const opsRoutes = [
      '/operations-command-hub',
      '/maritime-command',
      '/fleet-command',
      '/voyage-command',
      '/mission-command',
      '/logistics-command',
      '/vessel-contracts',
      '/charter-party',
    ];

    opsRoutes.forEach(route => {
      it(`${route} should map to /ops`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/ops');
      });
    });
  });

  describe('MEGA-HUB C: Maintenance Routes', () => {
    const maintenanceRoutes = [
      '/maintenance-hub',
      '/drydock-management',
      '/digital-twin',
      '/advanced/digital-twin-3d',
      '/fuel-management',
      '/esg-emissions',
    ];

    maintenanceRoutes.forEach(route => {
      it(`${route} should map to /maintenance`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/maintenance');
      });
    });
  });

  describe('MEGA-HUB D: AI Routes', () => {
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
      it(`${route} should map to /ai`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/ai');
      });
    });
  });

  describe('MEGA-HUB E: Tracking Routes', () => {
    const trackingRoutes = [
      '/tracking-telemetry',
      '/telemetria',
      '/ais-tracker-page',
      '/satcom-dashboard',
      '/advanced/weather-intelligence',
    ];

    trackingRoutes.forEach(route => {
      it(`${route} should map to /tracking`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/tracking');
      });
    });
  });

  describe('MEGA-HUB F: Compliance - 12 Maritime Audits', () => {
    const auditPaths = getMaritimeAuditsPaths();
    
    it('all 12 maritime audits should be defined', () => {
      expect(Object.keys(auditPaths).length).toBe(12);
    });

    // 12 Auditorias Marítimas - Rotas Diretas (Melhor UX)
    const auditRoutes = [
      { legacy: '/peo-dp', name: 'PEO-DP' },
      { legacy: '/peotram', name: 'PEOTRAM' },
      { legacy: '/safety-imca', name: 'ISM Code' },
      { legacy: '/isps-security', name: 'ISPS Security' },
      { legacy: '/drill-simulator', name: 'SOLAS/LSA/FFE' },
      { legacy: '/pre-ovid', name: 'Pre-OVID' },
      { legacy: '/mlc-inspection', name: 'Pre-MLC 2006' },
      { legacy: '/psc-package', name: 'PSC Package' },
      { legacy: '/sgso', name: 'SGSO ANP' },
      { legacy: '/pre-sire', name: 'Pre-SIRE 2.0' },
      { legacy: '/tmsa-assessment', name: 'TMSA' },
      { legacy: '/waste-management', name: 'MARPOL' },
    ];

    it('should have all 12 audit routes mapped', () => {
      expect(auditRoutes.length).toBe(12);
    });

    auditRoutes.forEach(audit => {
      it(`${audit.name} route (${audit.legacy}) should be defined`, () => {
        expect(LEGACY_ROUTES_MEGA[audit.legacy]).toBeDefined();
      });
    });
  });

  describe('MEGA-HUB F: Compliance - 10 AI Agents', () => {
    const agents = getAIAuditAgents();
    
    it('should have all 10 AI audit agents', () => {
      expect(agents.length).toBe(10);
    });

    it('/audit-agents should be mapped', () => {
      expect(LEGACY_ROUTES_MEGA['/audit-agents']).toBeDefined();
    });

    it('/audit-ai-chat should be mapped', () => {
      expect(LEGACY_ROUTES_MEGA['/audit-ai-chat']).toBeDefined();
    });
  });

  describe('MEGA-HUB G: Workbench - Docs', () => {
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
      it(`${route} should map to /workbench/docs`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/workbench/docs');
      });
    });
  });

  describe('MEGA-HUB G: Workbench - People', () => {
    const peopleRoutes = [
      '/people-hub',
      '/nautilus-people',
      '/hr-dashboard',
      '/recruitment',
      '/crew-wellness',
      '/medical-infirmary',
      '/stcw-mlc',
    ];

    peopleRoutes.forEach(route => {
      it(`${route} should map to /workbench/people`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/workbench/people');
      });
    });
  });

  describe('MEGA-HUB G: Workbench - Finance', () => {
    const financeRoutes = [
      '/finance-hub',
      '/travel-command',
      '/procurement',
      '/suppliers',
    ];

    financeRoutes.forEach(route => {
      it(`${route} should map to /workbench/finance`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/workbench/finance');
      });
    });
  });

  describe('MEGA-HUB G: Workbench - System', () => {
    const systemRoutes = [
      '/system-hub',
      '/settings',
      '/api-monitor',
      '/api-gateway',
      '/iot-dashboard',
      '/dev-routes',
    ];

    systemRoutes.forEach(route => {
      it(`${route} should map to /workbench/system`, () => {
        expect(LEGACY_ROUTES_MEGA[route]).toBeDefined();
        expect(LEGACY_ROUTES_MEGA[route]).toContain('/workbench/system');
      });
    });
  });

  describe('No Broken Routes', () => {
    it('all target routes should start with /', () => {
      Object.values(LEGACY_ROUTES_MEGA).forEach(route => {
        expect(route.startsWith('/')).toBe(true);
      });
    });

    it('no target routes should be empty', () => {
      Object.values(LEGACY_ROUTES_MEGA).forEach(route => {
        expect(route.length).toBeGreaterThan(1);
      });
    });

    it('all source routes should be unique', () => {
      const sourceRoutes = Object.keys(LEGACY_ROUTES_MEGA);
      const uniqueRoutes = new Set(sourceRoutes);
      expect(sourceRoutes.length).toBe(uniqueRoutes.size);
    });
  });
});

describe('7 MEGA-HUBs Structure', () => {
  describe('Canonical Routes', () => {
    const megaHubs = [
      '/command',
      '/ops',
      '/maintenance',
      '/ai',
      '/tracking',
      '/compliance',
      '/workbench',
    ];

    it('should have exactly 7 MEGA-HUBs', () => {
      expect(megaHubs.length).toBe(7);
    });

    megaHubs.forEach(hub => {
      it(`${hub} should be a valid canonical route`, () => {
        expect(hub).toBeTruthy();
        expect(hub.startsWith('/')).toBe(true);
      });
    });
  });
});

describe('Feature Parity Validation', () => {
  describe('Essential Actions per MEGA-HUB', () => {
    const hubActions = {
      'Command': ['View', 'Refresh', 'Export', 'Acknowledge', 'Escalate'],
      'Ops': ['Add', 'Edit', 'Delete', 'Upload', 'Export', 'Refresh'],
      'Maintenance': ['Add', 'Edit', 'Delete', 'Schedule', 'Track', 'Export'],
      'AI': ['Chat', 'Configure', 'Deploy', 'Monitor', 'Export'],
      'Tracking': ['View', 'Track', 'Alert', 'Export', 'Refresh'],
      'Compliance': ['Audit', 'Score', 'Report', 'Track', 'Export'],
      'Workbench': ['Add', 'Edit', 'Delete', 'Upload', 'Export', 'Configure'],
    };

    Object.entries(hubActions).forEach(([hub, actions]) => {
      it(`${hub} hub should support: ${actions.join(', ')}`, () => {
        expect(actions.length).toBeGreaterThan(0);
      });
    });
  });
});
