# Legacy Compliance Modules

**PATCH 92.0** - Archived on 2025-10-24

This directory contains the legacy compliance modules that were consolidated into the unified `compliance-hub` module.

## Archived Modules

### 1. audit-center
- **Original Path:** `src/modules/compliance/audit-center/`
- **Status:** Deprecated
- **Features:**
  - Audit management with IMCA, ISM, ISPS support
  - Checklist execution
  - AI evaluation
  - Evidence upload
  - PDF generation

### 2. checklists
- **Original Path:** `src/modules/features/checklists/`
- **Status:** Deprecated
- **Features:**
  - Smart checklist system
  - Dynamic templates
  - Execution tracking
  - AI suggestions
  - Historical records

### 3. risk-management
- **Original Path:** `src/modules/emergency/risk-management/`
- **Status:** Deprecated
- **Features:**
  - Risk assessment dashboard
  - Risk scoring (likelihood × impact)
  - Monitoring and tracking
  - Basic visualizations

### 4. compliance-hub-old
- **Original Path:** `src/modules/compliance/compliance-hub/`
- **Status:** Replaced
- **Features:**
  - Basic compliance overview
  - Simple metrics display
  - Placeholder for future features

## Migration to New Compliance Hub

The new unified `compliance-hub` (PATCH 92.0) consolidates all these modules into a single, comprehensive system with:

✅ **Documentation Section**
- Document upload with AI analysis
- Regulatory document management
- Automatic categorization and tagging

✅ **Checklists Section**
- Dynamic FMEA, ISM, ISPS, IMCA, NORMAM checklists
- Execution history and tracking
- Template management

✅ **Audits Section**
- Comprehensive audit management
- Automatic logging and traceability
- PDF report generation
- AI-powered compliance evaluation

✅ **Risks Section**
- Real-time risk monitoring
- AI-powered insights and recommendations
- Risk matrix visualization
- Mitigation tracking

## Key Improvements

1. **Unified Interface:** Single access point for all compliance activities
2. **AI Integration:** `runAIContext("compliance-review")` embedded throughout
3. **Better Organization:** Clear separation of concerns with modular components
4. **Enhanced Logging:** Comprehensive audit trail for all actions
5. **Improved UX:** Modern tabbed interface with consistent design
6. **Type Safety:** Unified type definitions across all features
7. **Better Testing:** Comprehensive test coverage (21+ tests)

## Migration Path

If you need to reference the old implementation:

1. All original files are preserved in their respective directories
2. No functionality was removed, only consolidated
3. All features from legacy modules are available in the new hub
4. Routes marked as deprecated in `src/modules/registry.ts`

## Restored Access

To restore a deprecated module (not recommended):

1. Update status from `deprecated` to `active` in `src/modules/registry.ts`
2. Clear browser cache
3. Navigate to the original route

## Support

For issues or questions about the migration, refer to:
- PATCH 92.0 documentation
- `modules/compliance-hub/README.md` (if created)
- Module registry: `src/modules/registry.ts`
