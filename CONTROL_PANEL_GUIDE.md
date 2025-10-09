# Admin Control Panel - Quick Reference

## 🎯 Overview

The Admin Control Panel is a centralized dashboard for managing and monitoring the entire Nautilus One system. It provides a comprehensive view of all modules, API integrations, system health, and developer tools.

## 📍 Access

**URL:** `/admin/control-panel`

**Required Permissions:** 
- `admin` role
- `hr_manager` role

## 🗂️ Tab Structure

### 1. Visão Geral (Overview)
- System status summary
- Quick access links to:
  - Admin Panel
  - API Tester
  - Health Monitor
  - Settings
- Real-time system information

### 2. Módulos (Modules)
- Complete list of all 32 system modules
- Status indicators:
  - ✅ **Funcional** (Functional) - Green
  - ⚠️ **Pendente** (Pending) - Yellow
  - ❌ **Desabilitado** (Disabled) - Red
- Search functionality
- Filter by status
- Direct links to functional modules

### 3. APIs
- Status of 7 external API integrations:
  - Mapbox
  - OpenAI (Chat)
  - Whisper
  - Skyscanner
  - Booking.com
  - Windy
  - Marine Traffic
- Response time metrics
- Last test timestamp
- Test all APIs button
- Link to detailed API Tester

### 4. Sistema (System)
- Real-time clock with date/time
- System uptime
- Performance metrics:
  - CPU usage
  - Memory usage
  - Active users
  - Requests per minute
- Overall system health status

### 5. Ferramentas (Tools)
- Developer utilities:
  - API Tester (active)
  - Health Monitor (active)
  - System Logs (coming soon)
  - Performance Analyzer (coming soon)
- System controls:
  - Rebuild Cache
  - Clear Sessions
  - Export Metrics
- Admin-only features (when logged as admin)

## 📊 Quick Stats

The dashboard displays 4 key metrics at the top:
1. **Módulos Ativos** - Number of functional modules
2. **Em Desenvolvimento** - Modules in development
3. **APIs Conectadas** - Number of connected APIs
4. **Usuários Ativos** - Current active users

## 🎨 Component Architecture

```
control-panel.tsx (Main page)
├── ModuleList.tsx (32 modules with search/filter)
├── APIStatus.tsx (API integration monitoring)
└── SystemInfo.tsx (Real-time system metrics)
```

## 🔧 Component Details

### ModuleList.tsx
- Displays all 32 modules
- Search by name or description
- Filter by status (All, Functional, Pending)
- Statistics summary
- Click to access functional modules

### APIStatus.tsx
- Shows 7 external API services
- Connection status with icons
- Response time badges
- "Test All" functionality
- Links to full API Tester

### SystemInfo.tsx
- Live clock (updates every second)
- Uptime tracker (updates every minute)
- System metrics (CPU, Memory, Users, Req/min)
- Refresh button for manual updates
- Status indicator (operational/warning/error)

## 🛠️ Integration Points

The control panel integrates with:
- `RoleBasedAccess` - Permission checking
- `ModulePageWrapper` - Consistent layout
- `ModuleHeader` - Standardized header with badges
- `MultiTenantWrapper` - Multi-tenant support
- Existing admin components (HealthStatusDashboard)

## 🎯 Use Cases

### For Administrators
- Monitor overall system health
- Check which modules are operational
- Verify API integrations are working
- Access developer tools quickly
- Manage system configurations

### For HR Managers
- View system status
- Access relevant modules
- Monitor user activity
- Check system availability

### For Developers
- Test API integrations
- Monitor system performance
- Access debugging tools
- Check module status
- Export system metrics

## 🔐 Security Features

- Role-based access control via `RoleBasedAccess`
- Not exposed in public navigation
- Protected route configuration
- Only visible to authenticated users with proper roles

## 📱 Responsive Design

- Desktop: Full 5-tab layout with detailed information
- Tablet: Responsive grid layout
- Mobile: Stacked layout with abbreviated labels

## 🚀 Future Enhancements

Planned features for future releases:
- Real-time log viewer
- Advanced performance analytics
- User session management
- Permission editor
- Automated health checks
- Alert configuration
- Backup management
- Audit log viewer

## 📝 Notes

- The page requires proper authentication before access
- Some metrics are simulated for demo purposes
- API status reflects last test results
- System uptime resets on page load
- All timestamps are displayed in Brazilian Portuguese format (pt-BR)

## 🐛 Troubleshooting

**Issue:** Page not loading
- **Solution:** Check if user has admin or hr_manager role

**Issue:** API status shows "Not Tested"
- **Solution:** Click "Test All" or navigate to API Tester

**Issue:** Module links not working
- **Solution:** Verify module is marked as "Functional"

**Issue:** Permission denied
- **Solution:** Ensure RoleBasedAccess is properly configured

## 📞 Support

For issues or questions, contact the development team or refer to the main documentation.
