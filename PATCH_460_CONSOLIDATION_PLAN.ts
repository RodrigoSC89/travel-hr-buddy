/**
 * PATCH 460 - Module Consolidation Documentation
 * Consolidates crew/ + crew-management/ and documents/ + document-hub/
 * 
 * ANALYSIS:
 * 
 * CREW MODULES:
 * - src/modules/crew/ (9 files) - Marked as "CONSOLIDATED", has ethics-guard, copilot
 * - src/modules/crew-management/ (6 files) - Has comprehensive UI with tabs
 * 
 * DECISION: Keep crew-management as primary, integrate crew/ features into it
 * 
 * DOCUMENTS MODULES:
 * - src/modules/documents/ (5 files) - Smaller module with templates
 * - src/modules/document-hub/ (22 files) - Comprehensive with AI documents, templates
 * 
 * DECISION: Keep document-hub as primary, consolidate documents/ into it
 * 
 * ROUTES TO CONSOLIDATE:
 * - /crew -> /crew-management
 * - /hr/crew -> /crew-management
 * - /operations/crew -> /crew-management
 * - /documents -> /document-hub
 * - /documents/ai -> /document-hub/ai
 * 
 * IMPLEMENTATION STEPS:
 * 1. Update route redirects in App.tsx/AppRouter.tsx
 * 2. Move unique functionality from crew/ to crew-management/
 * 3. Move unique functionality from documents/ to document-hub/
 * 4. Update all internal imports
 * 5. Test backward compatibility
 */

// Route consolidation mappings
export const ROUTE_CONSOLIDATION = {
  crew: {
    primary: '/crew-management',
    legacy: [
      '/crew',
      '/hr/crew',
      '/operations/crew'
    ]
  },
  documents: {
    primary: '/document-hub',
    legacy: [
      '/documents',
      '/documents/ai'
    ]
  }
};

// Module consolidation mappings
export const MODULE_CONSOLIDATION = {
  crew: {
    primary: 'src/modules/crew-management',
    legacy: 'src/modules/crew',
    features_to_migrate: [
      'ethics-guard.ts',
      'copilot/*',
      'hooks/useSync.ts'
    ]
  },
  documents: {
    primary: 'src/modules/document-hub',
    legacy: 'src/modules/documents',
    features_to_migrate: [
      'templates/*'
    ]
  }
};

/**
 * Migration checklist:
 * - [x] Analyze module structure and usage
 * - [ ] Update App.tsx with route redirects
 * - [ ] Update AppRouter.tsx with consolidated routes
 * - [ ] Copy unique features from crew/ to crew-management/
 * - [ ] Copy unique features from documents/ to document-hub/
 * - [ ] Update import statements
 * - [ ] Test all routes work correctly
 * - [ ] Verify no broken functionality
 */

export const CONSOLIDATION_STATUS = {
  crew: {
    analyzed: true,
    routes_identified: true,
    primary_module: 'crew-management',
    features_preserved: ['ethics-guard', 'copilot', 'sync'],
  },
  documents: {
    analyzed: true,
    routes_identified: true,
    primary_module: 'document-hub',
    features_preserved: ['templates', 'AI documents'],
  }
};
