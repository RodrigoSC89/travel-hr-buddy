# Module Control - Admin Guide

## Overview
The Module Control panel provides administrators with a centralized interface to manage module activation, view status, and control access across the Nautilus One system.

## Access
- **URL:** `/admin/module-control`
- **Required Role:** `admin`, `owner`
- **Permission:** Module management

## Features

### 1. Module Overview Dashboard
View comprehensive statistics:
- Total modules in the system
- Production-ready modules
- Modules in development
- Experimental features
- AI-enabled modules

### 2. Module Status Management
Each module displays:
- **Name:** Module identifier
- **Status Badge:** 
  - ✅ Production (green)
  - ⚠️ Development (yellow)
  - 🧪 Experimental (purple)
  - ❌ Deprecated (red)
- **Category:** Functional grouping
- **AI Indicator:** Shows if module has AI capabilities
- **Toggle Switch:** Activate/deactivate module

### 3. Filtering System

#### Search
- Search by module name
- Search by description
- Real-time results

#### Category Filter
Filter by functional category:
- Core & Dashboard
- Maritime Operations
- Compliance & Audit
- Communication
- AI & Intelligence
- Documents
- Analytics
- HR & Training
- Logistics
- System

#### Status Tabs
Quick access by status:
- **All:** Show all modules
- **Production:** Stable modules only
- **Development:** In-progress features
- **Experimental:** Beta testing
- **Deprecated:** Outdated modules

### 4. Module Actions

#### Toggle Activation
- Click the switch to activate/deactivate
- Deprecated modules cannot be toggled
- Changes are logged (future feature)

#### Module Menu
- **Open Module:** Navigate to module page
- **View History:** See activation history (future feature)

## Module Categories

### Core
- Dashboard Principal
- System Overview

### Maritime
- Fleet Management
- Crew Management
- Bridge Link
- DP Intelligence
- Mission Control

### Compliance
- SGSO
- ISM Audits
- Compliance Hub
- Checklists

### Communication
- Communication Center
- Channel Manager
- Notification Center

### AI & Intelligence
- AI Assistant
- AI Insights
- Voice Assistant
- Automation Engine

### Documents
- Document Hub
- Document Templates

### Analytics
- Analytics Central
- Reports
- Performance Monitor

### HR
- Employee Portal
- Training Academy
- User Management

### Logistics
- Voyage Planner
- Logistics Hub
- Fuel Optimizer

## Best Practices

### Module Activation
1. **Review Status:** Check if module is production-ready
2. **Check Dependencies:** Ensure required modules are active
3. **Test First:** Activate in development environment first
4. **Monitor:** Watch for issues after activation

### Deactivation
1. **Check Usage:** Verify no active users
2. **Notify Users:** Communicate planned downtime
3. **Backup Data:** Ensure data is safe
4. **Document:** Record reason for deactivation

### Status Guidelines
- **Production:** Tested, stable, documented
- **Development:** Active work, may have bugs
- **Experimental:** Early stage, use with caution
- **Deprecated:** Plan migration, do not activate

## Troubleshooting

### Module Won't Activate
1. Check user role/permissions
2. Verify module status (not deprecated)
3. Check system logs
4. Ensure dependencies are met

### Missing Modules
1. Verify `modules-registry.json` is up to date
2. Check category filters
3. Clear search query
4. Refresh page

### Performance Issues
1. Reduce active modules
2. Deactivate unused features
3. Check browser console
4. Report to support

## Security Considerations

### Access Control
- Only admins can access this panel
- Changes are logged (when implemented)
- Audit trail maintained
- Role-based restrictions apply

### Module Isolation
- Deactivated modules are inaccessible
- Data remains safe
- No data loss on deactivation
- Easy reactivation

## Future Enhancements
- [ ] Real-time activation history
- [ ] Dependency graph visualization
- [ ] Bulk activation/deactivation
- [ ] Scheduled activation
- [ ] Usage analytics per module
- [ ] Module health monitoring
- [ ] Automated testing before activation

## Support
For technical issues or questions:
1. Check system logs
2. Review module documentation
3. Contact system administrator
4. File support ticket

## Related Documentation
- [PATCH 655 Implementation](../patches/655-navigation-dynamic.md)
- [Module LLM Helper Guide](./module-llm-helper.md)
- [Navigation Structure](../../src/hooks/useNavigationStructure.ts)
