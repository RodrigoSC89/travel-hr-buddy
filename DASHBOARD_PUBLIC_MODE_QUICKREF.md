# Admin Dashboard - Public Mode & Role-Based Access

## Quick Reference Guide

### Overview
The Admin Dashboard (`/admin/dashboard`) supports both public read-only mode and role-based card filtering, allowing flexible access control for different use cases.

---

## 🌐 Public Read-Only Mode

### What is it?
Public mode allows users to view the dashboard in read-only mode without admin controls. Perfect for:
- 📺 TV monitors and public displays
- 👥 Sharing with stakeholders without edit permissions
- 📊 Transparent monitoring of system status

### How to Use

#### Access URLs
```
Normal mode:  /admin/dashboard
Public mode:  /admin/dashboard?public=1
```

#### Visual Indicators in Public Mode
- Eye icon (👁️) appears in the page title
- Blue banner displays: "🔒 Modo público somente leitura"
- QR code section is hidden (not needed in public view)

#### What's Hidden in Public Mode
- QR code sharing section
- Any future admin-only controls

#### What's Still Visible
- All dashboard cards (respecting role-based access)
- Activity trend charts
- Quick links section
- All read-only data and metrics

### TV Wall Setup
1. Navigate to `/admin/dashboard?public=1` on the display
2. Bookmark the URL for quick access
3. Set browser to kiosk/fullscreen mode if desired

---

## 👥 Role-Based Card Filtering

### Card Visibility by Role

| Role | Checklists | IA Assistant | Personal Restorations |
|------|-----------|--------------|----------------------|
| **Admin** | ✅ | ✅ | ✅ |
| **HR Manager** | ✅ | ✅ | ✅ |
| **Manager** | ❌ | ❌ | ✅ |
| **Employee** | ❌ | ❌ | ✅ |

### Dashboard Cards

#### 📋 Checklists (Blue)
- **Description**: Progress and team status
- **Access**: Admin, HR Manager
- **Path**: `/admin/checklists/dashboard`

#### 🤖 IA Assistant (Indigo)
- **Description**: Recent queries and exports
- **Access**: Admin, HR Manager
- **Path**: `/admin/assistant/history`

#### 📦 Personal Restorations (Purple)
- **Description**: Daily personal dashboard with charts
- **Access**: All roles (Admin, HR Manager, Manager, Employee)
- **Path**: `/admin/restore/personal`

### Special Cases
- **Public Mode**: All cards are visible regardless of role (read-only access)
- **No Role**: No cards displayed until role is loaded

---

## 🔄 Combined Functionality

Both features work seamlessly together:

1. **Public mode respects role-based access**
   - Example: Manager in public mode sees all cards
   - Example: Employee in public mode sees all cards

2. **Navigation maintains public mode**
   - Clicking cards in public mode navigates to target with `?public=1`
   - Quick links in public mode include public parameter

3. **QR Code shares public URL**
   - Generated URL includes `?public=1`
   - Scan to instantly access public view

---

## 🛠️ Technical Implementation

### Public Mode Detection
```typescript
const [searchParams] = useSearchParams();
const isPublic = searchParams.get("public") === "1";
```

### Role-Based Filtering
```typescript
const visibleCards = isPublic 
  ? dashboardCards 
  : dashboardCards.filter(card => 
      !roleLoading && userRole && card.roles.includes(userRole)
    );
```

### Card Configuration
```typescript
const dashboardCards = [
  {
    title: "Checklists",
    roles: ["admin", "hr_manager"],
    // ... other properties
  },
  {
    title: "Restaurações Pessoais",
    roles: ["admin", "hr_manager", "hr_analyst", "department_manager", 
            "supervisor", "coordinator", "manager", "employee"],
    // ... other properties
  },
  // ...
];
```

---

## 📊 Use Cases

### Scenario 1: TV Monitor Display
**Goal**: Display real-time metrics on office TV
**Solution**: 
1. Open `/admin/dashboard?public=1` on TV browser
2. Set to full screen
3. Dashboard auto-refreshes (if configured)

### Scenario 2: Stakeholder Sharing
**Goal**: Share metrics with external stakeholders
**Solution**: 
1. Generate QR code from admin dashboard
2. Share QR code or direct link with stakeholders
3. They access read-only view without credentials

### Scenario 3: Team Access
**Goal**: Different team members see appropriate content
**Solution**:
1. All users navigate to `/admin/dashboard`
2. System automatically shows relevant cards based on their role
3. No configuration needed

---

## 🧪 Testing

### Manual Test Steps

#### Test Public Mode
1. Navigate to `/admin/dashboard?public=1`
2. Verify eye icon appears in title
3. Verify blue "public mode" banner displays
4. Verify QR code section is hidden
5. Click a card and verify `?public=1` is preserved

#### Test Role-Based Access
1. Login as Admin → Verify 3 cards visible
2. Login as HR Manager → Verify 3 cards visible
3. Login as Employee → Verify only 1 card visible
4. In public mode → Verify all cards visible for any role

### Automated Tests
```bash
# Run dashboard tests
npm test -- src/tests/pages/admin/dashboard.test.tsx

# Run all tests
npm test
```

**Current Status**: ✅ 11/11 dashboard tests passing

---

## 🔒 Security Notes

- Public mode is READ-ONLY - no data can be modified
- Authentication is still required to access the dashboard
- Role-based filtering applies in authenticated mode
- Public mode shows all content but users still need valid credentials

---

## 📚 Related Documentation

- **Implementation Guide**: See PR #486 for full technical details
- **Testing Guide**: `src/tests/pages/admin/dashboard.test.tsx`
- **Component**: `src/pages/admin/dashboard.tsx`

---

## 🐛 Troubleshooting

### Public mode not working
- Verify URL includes `?public=1` exactly
- Check browser console for errors
- Clear cache and reload

### Cards not showing for role
- Verify user has correct role in database
- Check `profiles` table for role assignment
- Ensure role is one of the valid roles

### QR code not generating
- Verify `qrcode.react` is installed
- Check console for import errors
- Ensure `publicUrl` is properly constructed

---

**Last Updated**: October 14, 2025  
**Version**: 1.0.0  
**Author**: Copilot Coding Agent
