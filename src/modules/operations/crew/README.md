# Crew Management Module

## 📋 Overview

**Category**: Operations  
**Route**: `/crew`  
**Status**: Partial Implementation

Manage crew members, assignments, certifications, and scheduling for maritime operations.

## 🎯 Objectives

- Manage crew member profiles and information
- Track certifications and compliance
- Handle crew assignments to vessels
- Schedule crew rotations and shifts
- Monitor crew availability and status

## 🏗️ Architecture

### Component Structure
```
operations/crew/
├── index.tsx               # Main module entry
└── components/            # Crew management UI components (to be added)
```

## 💾 Database Schema

### crew_members
```sql
CREATE TABLE crew_members (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  certifications TEXT[],
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### crew_assignments
```sql
CREATE TABLE crew_assignments (
  id UUID PRIMARY KEY,
  crew_id UUID REFERENCES crew_members(id),
  vessel_id UUID REFERENCES vessels(id),
  start_date DATE NOT NULL,
  end_date DATE,
  role VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Dependencies

- `@/components/ui/*` - UI components
- Fleet Management module - For vessel assignments
- Compliance Hub - For certification tracking

## 🚀 Usage Examples

```typescript
import CrewManagement from '@/modules/operations/crew';

function App() {
  return <CrewManagement />;
}
```

## 📚 Related Documentation

- [Operations Dashboard README](../operations-dashboard/README.md)
- [Fleet Management README](../../fleet/README.md)
- [Module Overview](/dev/docs/MODULES_OVERVIEW.md)

---

**Last Updated**: 2025-10-28  
**Status**: Requires database integration and full UI implementation
